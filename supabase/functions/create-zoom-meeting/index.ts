import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

async function getZoomAccessToken(): Promise<string> {
  const accountId = Deno.env.get('ZOOM_ACCOUNT_ID');
  const clientId = Deno.env.get('ZOOM_CLIENT_ID');
  const clientSecret = Deno.env.get('ZOOM_CLIENT_SECRET');

  if (!accountId) throw new Error('ZOOM_ACCOUNT_ID is not configured');
  if (!clientId) throw new Error('ZOOM_CLIENT_ID is not configured');
  if (!clientSecret) throw new Error('ZOOM_CLIENT_SECRET is not configured');

  const credentials = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=account_credentials&account_id=${accountId}`,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Zoom OAuth failed [${response.status}]: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, start_time, duration, student_name, teacher_name } = await req.json();

    if (!topic || !start_time) {
      return new Response(JSON.stringify({ error: 'topic and start_time are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = await getZoomAccessToken();

    // Create Zoom meeting
    const zoomResponse = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: topic || 'Kid2Kid CS Lesson',
        type: 2, // Scheduled meeting
        start_time,
        duration: duration || 60,
        timezone: 'UTC',
        settings: {
          join_before_host: true,
          waiting_room: false,
          auto_recording: 'none',
        },
      }),
    });

    const zoomData = await zoomResponse.json();
    if (!zoomResponse.ok) {
      throw new Error(`Zoom API failed [${zoomResponse.status}]: ${JSON.stringify(zoomData)}`);
    }

    // Save to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const dbResponse = await fetch(`${supabaseUrl}/rest/v1/meetings`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        teacher_name: teacher_name || 'Teacher',
        student_name: student_name || 'Student',
        scheduled_date: start_time.split('T')[0],
        scheduled_time: start_time.split('T')[1]?.substring(0, 5) || '00:00',
        zoom_meeting_id: String(zoomData.id),
        zoom_join_url: zoomData.join_url,
        zoom_start_url: zoomData.start_url,
        zoom_password: zoomData.password,
        status: 'scheduled',
      }),
    });

    const dbData = await dbResponse.json();
    if (!dbResponse.ok) {
      throw new Error(`DB insert failed [${dbResponse.status}]: ${JSON.stringify(dbData)}`);
    }

    return new Response(JSON.stringify({
      success: true,
      meeting: dbData[0],
      zoom: {
        id: zoomData.id,
        join_url: zoomData.join_url,
        start_url: zoomData.start_url,
        password: zoomData.password,
      },
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error creating Zoom meeting:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
