import { supabase } from "@/integrations/supabase/client";
import { emailStudentPaired, emailVolunteerPaired } from "@/lib/notifyEmails";

const WW_PROGRAM = "Westwood Robotics - Python";
export const MAX_STUDENTS_PER_TEACHER = 1;

type App = {
  id: string;
  type: string;
  name: string;
  email: string;
  school: string | null;
  availability: string[] | null;
};

/**
 * Attempts to automatically pair a newly-approved person with the best
 * available counterpart, ranked by overlapping availability slots.
 * Returns the counterpart's name if a pairing was created.
 */
export async function autoPair(approved: {
  type: string;
  name: string;
  email: string;
}): Promise<string | null> {
  const [{ data: appData }, { data: pairData }] = await Promise.all([
    supabase.from("applications").select("*").eq("status", "approved"),
    supabase.from("pairings").select("*"),
  ]);

  const apps = ((appData as App[]) || []).filter(a => a.school !== WW_PROGRAM);
  const pairings = pairData || [];

  const teacherLoad = (n: string) => pairings.filter((p: any) => p.teacher_name === n).length;
  const studentPaired = (n: string) => pairings.some((p: any) => p.student_name === n);

  const me = apps.find(a => a.name === approved.name && a.type === approved.type);
  if (!me) return null;

  const isStudent = approved.type === "student";
  if (isStudent && studentPaired(me.name)) return null;
  if (!isStudent && teacherLoad(me.name) >= MAX_STUDENTS_PER_TEACHER) return null;

  const mySlots = new Set(me.availability || []);
  const overlap = (a: App) => (a.availability || []).filter(s => mySlots.has(s)).length;

  const candidates = apps
    .filter(a =>
      isStudent
        ? a.type === "volunteer" && teacherLoad(a.name) < MAX_STUDENTS_PER_TEACHER
        : a.type === "student" && !studentPaired(a.name)
    )
    .sort((a, b) => overlap(b) - overlap(a));

  const match = candidates[0];
  if (!match) return null;

  const teacher = isStudent ? match : me;
  const student = isStudent ? me : match;

  const { error } = await supabase.from("pairings").insert({
    teacher_name: teacher.name,
    student_name: student.name,
  } as any);
  if (error) return null;

  emailStudentPaired(student.email, student.name, teacher.name, teacher.email);
  emailVolunteerPaired(teacher.email, teacher.name, student.name, student.email);

  return match.name;
}
