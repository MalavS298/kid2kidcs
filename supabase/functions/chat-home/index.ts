import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the friendly Kid2Kid CS assistant on the landing page of kid2kidcs.lovable.app.

About Kid2Kid CS:
- A FREE 4-week 1-on-1 Python computer science program.
- High-school student volunteers teach middle-school students (grades 6-8).
- Curriculum: Week 1 Variables & Types, Week 2 Conditionals, Week 3 Loops, Week 4 Functions.
- Each week has a lesson notebook (Jupyter .ipynb) plus a coding exercise that starts with 3 MCQ questions before unlocking the code editor.
- Sessions are weekly 1-hour Google Meet meetings scheduled in-app. Volunteer hours are only awarded when BOTH the student AND teacher mark attendance.
- To join, visitors click "Join Now" and apply as either a Student or a Volunteer. Admins review and pair them.
- Volunteer teachers must be in high school (grades 9-12) with some Python experience.
- Contact email for anything you cannot answer: kid2kidcs@outlook.com.

Tone & rules:
- Be warm, concise, and encouraging. Use short paragraphs and markdown (bold, bullet lists) when useful.
- Never invent facts not listed above. If you genuinely don't know something, say so briefly and point them to kid2kidcs@outlook.com.
- Don't promise specific start dates, prices, or partnerships — the program is free and runs in cohorts; refer details to email.
- Don't ask the user for personal info (no emails, phone numbers, addresses).
- Keep answers under ~120 words unless they explicitly ask for detail.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "I'm getting a lot of questions right now — please try again in a minute!" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please email kid2kidcs@outlook.com." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat-home error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
