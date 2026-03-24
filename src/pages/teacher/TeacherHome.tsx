import { useState, useEffect } from "react";
import { Clock, Users, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const parseDuration = (d: string): number => {
  const match = d.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
};

const TeacherHome = () => {
  const user = JSON.parse(localStorage.getItem("k2k_user") || '{"name":"Teacher"}');
  const [hours, setHours] = useState(0);
  const [sessions, setSessions] = useState(0);
  const [students, setStudents] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("meetings")
        .select("*")
        .eq("teacher_name", user.name)
        .eq("status", "completed");
      if (data) {
        setHours(data.reduce((sum, m) => sum + parseDuration(m.duration), 0));
        setSessions(data.length);
        setStudents(new Set(data.map(m => m.student_name)).size);
      }
    };
    fetch();
  }, [user.name]);

  const statCards = [
    { icon: Clock, label: "Volunteer Hours", value: String(hours), bg: "bg-primary" },
    { icon: Calendar, label: "Sessions Held", value: String(sessions), bg: "bg-[hsl(25,95%,53%)]" },
    { icon: Users, label: "Total Students", value: String(students), bg: "bg-[hsl(160,84%,39%)]" },
  ];

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Teacher Dashboard</h1>
      <p className="text-muted-foreground mb-8">Manage your sessions and track student progress.</p>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {statCards.map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-5 text-primary-foreground`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <s.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-primary-foreground/80">{s.label}</span>
            </div>
            <div className="text-3xl font-bold font-mono">{s.value}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-bold mb-3">Quick Upcoming Sessions</h2>
        <div className="rounded-xl bg-card shadow-subtle p-6">
          <div className="text-center text-muted-foreground py-4">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm">No upcoming sessions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherHome;
