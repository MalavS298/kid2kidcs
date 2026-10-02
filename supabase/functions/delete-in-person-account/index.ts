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
    const { applicationId } = await req.json();
    if (!applicationId) return json({ error: "Missing application id." }, 400);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: app, error: appErr } = await admin
      .from("applications")
      .select("id, name, type, user_id")
      .eq("id", applicationId)
      .maybeSingle();
    if (appErr) return json({ error: appErr.message }, 400);
    if (!app) return json({ error: "Student not found." }, 404);
    if (app.type !== "in_person") return json({ error: "Only in-person students can be deleted here." }, 400);

    // Remove their saved code, then the application, then the auth account.
    await admin.from("sandbox_snippets").delete().eq("student_name", app.name);
    const { error: delAppErr } = await admin.from("applications").delete().eq("id", app.id);
    if (delAppErr) return json({ error: delAppErr.message }, 400);

    if (app.user_id) {
      const { error: delUserErr } = await admin.auth.admin.deleteUser(app.user_id);
      if (delUserErr) return json({ error: delUserErr.message }, 400);
    }

    return json({ ok: true });
  } catch (e) {
    return json({ error: (e as Error).message || "Something went wrong." }, 500);
  }
});
