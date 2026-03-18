import { Users } from "lucide-react";

const students = [
  { name: "Alex Chen", week: 2, progress: [true, false, false, false], lastActive: "Mar 18, 2026" },
  { name: "Sam Lee", week: 1, progress: [false, false, false, false], lastActive: "Mar 17, 2026" },
];

const TeacherManage = () => (
  <div className="p-8 max-w-4xl">
    <h1 className="text-section font-medium mb-2">Manage Students</h1>
    <p className="text-muted-foreground mb-8">Track your students' progress through the 4-week program.</p>

    <div className="space-y-4">
      {students.map((s, i) => (
        <div key={i} className="rounded-lg bg-card shadow-subtle p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-ui-sm font-medium text-primary">
                {s.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-[12px] text-muted-foreground">Currently on Week {s.week} · Last active: {s.lastActive}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {[1, 2, 3, 4].map(w => {
              const done = s.progress[w - 1];
              const current = w === s.week;
              return (
                <div key={w} className="flex-1">
                  <div className={`h-2 rounded-full ${done ? "bg-green-500" : current ? "bg-primary" : "bg-secondary"}`} />
                  <div className="text-[11px] text-muted-foreground mt-1 text-center">
                    Week {w}
                  </div>
                  <div className="text-[10px] text-center text-muted-foreground">
                    {done ? "✓ Done" : current ? "Active" : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TeacherManage;
