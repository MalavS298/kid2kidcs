import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, Link as LinkIcon, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { emailStudentPaired, emailVolunteerPaired } from "@/lib/notifyEmails";

const WW_PROGRAM = "Westwood Robotics - Python";
const MAX_STUDENTS_PER_TEACHER = 3;

type Application = {
  id: string;
  type: string;
  name: string;
  age: number;
  email: string;
  school: string | null;
  prior_experience: string | null;
  status: string;
};

type Pairing = {
  id: string;
  teacher_name: string;
  student_name: string;
};

const AdminPairing = () => {
  const [apps, setApps] = useState<Application[]>([]);
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: appData }, { data: pairData }] = await Promise.all([
      supabase.from("applications").select("*").eq("status", "approved"),
      supabase.from("pairings").select("*").order("created_at", { ascending: false }),
    ]);
    setApps((appData as Application[]) || []);
    setPairings((pairData as Pairing[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Exclude WW Robotics students — they're admin-managed and don't get teacher pairings.
  const allTeachers = apps.filter(a => a.type === "volunteer");
  const allStudents = apps.filter(a => a.type === "student" && a.school !== WW_PROGRAM);

  const teacherCount = (name: string) => pairings.filter(p => p.teacher_name === name).length;
  const studentPaired = (name: string) => pairings.some(p => p.student_name === name);

  // Hide teachers already at 3 students; hide students already paired (1 pairing each).
  const availableTeachers = allTeachers.filter(t => teacherCount(t.name) < MAX_STUDENTS_PER_TEACHER);
  const availableStudents = allStudents.filter(s => !studentPaired(s.name));

  const handlePair = async () => {
    if (!selectedTeacher || !selectedStudent) return;
    setSaving(true);
    const { error } = await supabase.from("pairings").insert({
      teacher_name: selectedTeacher,
      student_name: selectedStudent,
    } as any);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Paired ${selectedTeacher} with ${selectedStudent}`);

    // Send pairing emails
    const teacherApp = apps.find(a => a.name === selectedTeacher && a.type === "volunteer");
    const studentApp = apps.find(a => a.name === selectedStudent && a.type === "student");
    if (studentApp) emailStudentPaired(studentApp.email, studentApp.name, selectedTeacher);
    if (teacherApp) {
      const allStudents = [
        ...pairings.filter(p => p.teacher_name === selectedTeacher).map(p => p.student_name),
        selectedStudent,
      ];
      emailVolunteerPaired(teacherApp.email, teacherApp.name, allStudents);
    }

    setSelectedTeacher(null);
    setSelectedStudent(null);
    load();
  };

  const removePair = async (id: string) => {
    await supabase.from("pairings").delete().eq("id", id);
    toast.success("Pairing removed");
    load();
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading…
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-section font-medium mb-2">Teacher-Student Pairing</h1>
      <p className="text-muted-foreground mb-8">
        Each volunteer teaches up to {MAX_STUDENTS_PER_TEACHER} students. Each student gets exactly one volunteer.
      </p>

      <div className="rounded-lg bg-card shadow-subtle p-6 mb-8">
        <h3 className="font-medium mb-4 flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Create New Pairing</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-ui-sm text-muted-foreground mb-2">
              Available Volunteers ({availableTeachers.length})
            </div>
            <div className="space-y-2 max-h-80 overflow-auto">
              {availableTeachers.length === 0 ? (
                <p className="text-xs text-muted-foreground p-3">All approved volunteers are at the {MAX_STUDENTS_PER_TEACHER}-student limit.</p>
              ) : availableTeachers.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTeacher(t.name)}
                  className={`w-full text-left p-3 rounded-md text-ui-sm transition-colors ${
                    selectedTeacher === t.name ? "bg-primary/10 ring-1 ring-primary" : "bg-secondary/50 hover:bg-secondary"
                  }`}
                >
                  <div className="font-medium">{t.name}</div>
                  <div className="text-[12px] text-muted-foreground">
                    {teacherCount(t.name)}/{MAX_STUDENTS_PER_TEACHER} students · {t.email}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-ui-sm text-muted-foreground mb-2">
              Unpaired Students ({availableStudents.length})
            </div>
            <div className="space-y-2 max-h-80 overflow-auto">
              {availableStudents.length === 0 ? (
                <p className="text-xs text-muted-foreground p-3">All approved students are already paired.</p>
              ) : availableStudents.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStudent(s.name)}
                  className={`w-full text-left p-3 rounded-md text-ui-sm transition-colors ${
                    selectedStudent === s.name ? "bg-primary/10 ring-1 ring-primary" : "bg-secondary/50 hover:bg-secondary"
                  }`}
                >
                  <div className="font-medium">{s.name}</div>
                  <div className="text-[12px] text-muted-foreground">Age {s.age} · {s.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <Button
          className="mt-4"
          size="sm"
          onClick={handlePair}
          disabled={!selectedTeacher || !selectedStudent || saving}
        >
          {saving && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
          Pair Selected
        </Button>
      </div>

      <div className="rounded-lg bg-card shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-medium flex items-center gap-2"><Users className="w-4 h-4" /> Current Pairings ({pairings.length})</h3>
        </div>
        {pairings.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No pairings yet.</p>
        ) : (
          <table className="w-full text-ui-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left p-3 font-medium">Volunteer</th>
                <th className="text-left p-3 font-medium">Student</th>
                <th className="text-left p-3 font-medium">Volunteer Load</th>
                <th className="text-right p-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {pairings.map(p => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-primary/5 transition-colors">
                  <td className="p-3">{p.teacher_name}</td>
                  <td className="p-3">{p.student_name}</td>
                  <td className="p-3 font-mono text-xs">
                    {teacherCount(p.teacher_name)}/{MAX_STUDENTS_PER_TEACHER}
                  </td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => removePair(p.id)}>
                      <X className="w-3 h-3" /> Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPairing;
