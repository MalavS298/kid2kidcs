import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Unlock } from "lucide-react";

const studentsData = [
  { name: "Alex Chen", unlockedWeeks: 2, progress: [true, false, false, false], lastActive: "Mar 18, 2026" },
  { name: "Sam Lee", unlockedWeeks: 1, progress: [false, false, false, false], lastActive: "Mar 17, 2026" },
];

const TeacherManage = () => {
  const [students, setStudents] = useState(studentsData);

  const unlockNextWeek = (index: number) => {
    setStudents(prev => prev.map((s, i) => {
      if (i !== index || s.unlockedWeeks >= 4) return s;
      const newUnlocked = s.unlockedWeeks + 1;
      // Also update localStorage for demo (in production this would be a DB call)
      localStorage.setItem("k2k_unlocked_weeks", String(newUnlocked));
      return { ...s, unlockedWeeks: newUnlocked };
    }));
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-section font-medium mb-2">Manage Students</h1>
      <p className="text-muted-foreground mb-8">Track progress and unlock weeks for your students.</p>

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
                  <div className="text-[12px] text-muted-foreground">
                    Weeks 1–{s.unlockedWeeks} unlocked · Last active: {s.lastActive}
                  </div>
                </div>
              </div>
              {s.unlockedWeeks < 4 && (
                <Button size="sm" variant="outline" onClick={() => unlockNextWeek(i)}>
                  <Unlock className="w-3 h-3" /> Unlock Week {s.unlockedWeeks + 1}
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {[1, 2, 3, 4].map(w => {
                const done = s.progress[w - 1];
                const unlocked = w <= s.unlockedWeeks;
                const current = unlocked && !done && (w === 1 || s.progress[w - 2]);
                return (
                  <div key={w} className="flex-1">
                    <div className={`h-2 rounded-full ${
                      done ? "bg-green-500" : current ? "bg-primary" : unlocked ? "bg-primary/30" : "bg-secondary"
                    }`} />
                    <div className="text-[11px] text-muted-foreground mt-1 text-center flex items-center justify-center gap-1">
                      {!unlocked && <Lock className="w-2.5 h-2.5" />}
                      Week {w}
                    </div>
                    <div className="text-[10px] text-center text-muted-foreground">
                      {done ? "✓ Done" : current ? "Active" : unlocked ? "Unlocked" : "Locked"}
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
};

export default TeacherManage;
