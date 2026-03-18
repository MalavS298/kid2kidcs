import { Clock, Users, Calendar, TrendingUp } from "lucide-react";

const TeacherHome = () => {
  const user = JSON.parse(localStorage.getItem("k2k_user") || '{"name":"Teacher"}');

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-section font-medium mb-2">Welcome back, {user.name}</h1>
      <p className="text-muted-foreground mb-8">Here's your teaching overview.</p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="rounded-lg bg-card shadow-card p-6">
          <div className="flex items-center gap-2 text-ui-sm text-muted-foreground mb-3">
            <Clock className="w-4 h-4" /> Volunteer Hours
          </div>
          <div className="text-4xl font-medium font-mono text-primary">24.5</div>
          <div className="text-ui-sm text-muted-foreground mt-1">hours this semester</div>
        </div>
        <div className="rounded-lg bg-card shadow-card p-6">
          <div className="flex items-center gap-2 text-ui-sm text-muted-foreground mb-3">
            <Calendar className="w-4 h-4" /> Sessions Held
          </div>
          <div className="text-4xl font-medium font-mono text-primary">12</div>
          <div className="text-ui-sm text-muted-foreground mt-1">sessions completed</div>
        </div>
      </div>

      <div className="rounded-lg bg-card shadow-subtle p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-medium">Upcoming Sessions</h3>
        </div>
        <div className="space-y-3">
          {[
            { student: "Alex Chen", date: "Mar 20", time: "3:00 PM", week: "Week 2" },
            { student: "Sam Lee", date: "Mar 21", time: "4:00 PM", week: "Week 1" },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-ui-sm font-medium text-primary">
                  {s.student.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="text-ui-sm font-medium">{s.student}</div>
                  <div className="text-[12px] text-muted-foreground">{s.week}</div>
                </div>
              </div>
              <div className="text-ui-sm text-muted-foreground">{s.date} · {s.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherHome;
