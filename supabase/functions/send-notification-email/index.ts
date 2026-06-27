// Send a branded notification email via Microsoft Outlook (Graph) gateway.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/microsoft_outlook";

interface Payload {
  to: string | string[];
  subject: string;
  html: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const outlookKey = Deno.env.get("MICROSOFT_OUTLOOK_API_KEY");
    if (!lovableKey || !outlookKey) {
      return new Response(JSON.stringify({ error: "Outlook connection not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Payload;
    if (!body?.to || !body?.subject || !body?.html) {
      return new Response(JSON.stringify({ error: "Missing to/subject/html" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const recipients = Array.isArray(body.to) ? body.to : [body.to];
    const toRecipients = recipients
      .filter((e) => !!e && /\S+@\S+\.\S+/.test(e))
      .map((address) => ({ emailAddress: { address } }));

    if (toRecipients.length === 0) {
      return new Response(JSON.stringify({ error: "No valid recipients" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch(`${GATEWAY_URL}/me/sendMail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": outlookKey,
      },
      body: JSON.stringify({
        message: {
          subject: body.subject,
          body: { contentType: "HTML", content: body.html },
          toRecipients,
        },
        saveToSentItems: true,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Outlook sendMail failed", res.status, text);
      return new Response(JSON.stringify({ error: "sendMail failed", status: res.status, detail: text }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
