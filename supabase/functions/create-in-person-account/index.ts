import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { code, name, age, email, password } = await req.json();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanName = String(name || "").trim().slice(0, 100);
    const ageNum = parseInt(age);
    if (!code || !cleanName || !cleanEmail || !password || !ageNum) return json({ error: "Please fill out all fields." }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return json({ error: "Please enter a valid email." }, 400);
    if (String(password).length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password))
      return json({ error: "Password doesn't meet the requirements." }, 400);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: event } = await admin
      .from("in_person_events")
      .select("id, name, active")
      .ilike("code", String(code).trim())
      .limit(1)
      .maybeSingle();
    if (!event || !event.active) return json({ error: "That code isn't valid." }, 400);

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
    });
    if (createErr) {
      const msg = /already/i.test(createErr.message) ? "An account with this email already exists. Try signing in." : createErr.message;
      return json({ error: msg }, 400);
    }

    const { error: appErr } = await admin.from("applications").insert({
      type: "in_person",
      name: cleanName,
      age: ageNum,
      email: cleanEmail,
      availability: [],
      status: "approved",
      event_id: event.id,
      user_id: created.user?.id,
    });
    if (appErr) return json({ error: appErr.message }, 400);

    return json({ ok: true, eventId: event.id, eventName: event.name });
  } catch (e) {
    return json({ error: (e as Error).message || "Something went wrong." }, 500);
  }
});
