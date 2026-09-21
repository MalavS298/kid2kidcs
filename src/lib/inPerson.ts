import { supabase } from "@/integrations/supabase/client";

export interface K2KUser {
  name: string;
  email?: string;
  role?: string;
  pending?: boolean;
  inPerson?: boolean;
  eventId?: string;
  eventName?: string;
  teacher?: string;
}

export const getUser = (): K2KUser => {
  try {
    return JSON.parse(localStorage.getItem("k2k_user") || '{"name":"Student"}');
  } catch {
    return { name: "Student" };
  }
};

export const isInPerson = () => !!getUser().inPerson;

/**
 * Auto-sync a student's exercise code to the admin dashboard.
 * One snippet per student per week, kept up to date.
 */
export const syncExerciseCode = async (weekId: string, code: string) => {
  const user = getUser();
  if (!user.inPerson || !user.name) return;
  const title = `Week ${weekId} Exercise`;
  const { data: existing } = await supabase
    .from("sandbox_snippets")
    .select("id")
    .eq("student_name", user.name)
    .eq("title", title)
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    await supabase.from("sandbox_snippets").update({ code }).eq("id", existing.id);
  } else {
    await supabase.from("sandbox_snippets").insert({
      student_name: user.name,
      title,
      code,
      event_id: user.eventId ?? null,
    } as any);
  }
};
