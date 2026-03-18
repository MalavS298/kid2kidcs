import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, Link as LinkIcon } from "lucide-react";

const unpairedTeachers = [
  { id: 1, name: "Emily Davis", speciality: "Python Basics" },
  { id: 2, name: "Chris Wang", speciality: "Web Development" },
];

const unpairedStudents = [
  { id: 1, name: "Maya Johnson", grade: "7th Grade" },
  { id: 2, name: "Leo Martinez", grade: "6th Grade" },
  { id: 3, name: "Aria Patel", grade: "8th Grade" },
];

const existingPairs = [
  { teacher: "Jordan Smith", student: "Alex Chen", week: 2 },
  { teacher: "Jordan Smith", student: "Sam Lee", week: 1 },
];

const AdminPairing = () => {
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [pairs, setPairs] = useState(existingPairs);

  const handlePair = () => {
    if (selectedTeacher !== null && selectedStudent !== null) {
      const teacher = unpairedTeachers.find(t => t.id === selectedTeacher);
      const student = unpairedStudents.find(s => s.id === selectedStudent);
      if (teacher && student) {
        setPairs([...pairs, { teacher: teacher.name, student: student.name, week: 0 }]);
        setSelectedTeacher(null);
        setSelectedStudent(null);
      }
    }
  };

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-section font-medium mb-2">Teacher-Student Pairing</h1>
      <p className="text-muted-foreground mb-8">Assign teachers to students for the 4-week program.</p>

      {/* Pairing action */}
      <div className="rounded-lg bg-card shadow-subtle p-6 mb-8">
        <h3 className="font-medium mb-4 flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Create New Pairing</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-ui-sm text-muted-foreground mb-2">Select Teacher</div>
            <div className="space-y-2">
              {unpairedTeachers.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTeacher(t.id)}
                  className={`w-full text-left p-3 rounded-md text-ui-sm transition-colors ${
                    selectedTeacher === t.id ? "bg-primary/10 ring-1 ring-primary" : "bg-secondary/50 hover:bg-secondary"
                  }`}
                >
                  <div className="font-medium">{t.name}</div>
                  <div className="text-[12px] text-muted-foreground">{t.speciality}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-ui-sm text-muted-foreground mb-2">Select Student</div>
            <div className="space-y-2">
              {unpairedStudents.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStudent(s.id)}
                  className={`w-full text-left p-3 rounded-md text-ui-sm transition-colors ${
                    selectedStudent === s.id ? "bg-primary/10 ring-1 ring-primary" : "bg-secondary/50 hover:bg-secondary"
                  }`}
                >
                  <div className="font-medium">{s.name}</div>
                  <div className="text-[12px] text-muted-foreground">{s.grade}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <Button className="mt-4" size="sm" onClick={handlePair} disabled={!selectedTeacher || !selectedStudent}>
          Pair Selected
        </Button>
      </div>

      {/* Existing pairs */}
      <div className="rounded-lg bg-card shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-medium flex items-center gap-2"><Users className="w-4 h-4" /> Current Pairings</h3>
        </div>
        <table className="w-full text-ui-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left p-3 font-medium">Teacher</th>
              <th className="text-left p-3 font-medium">Student</th>
              <th className="text-left p-3 font-medium">Current Week</th>
              <th className="text-left p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((p, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-primary/5 transition-colors">
                <td className="p-3">{p.teacher}</td>
                <td className="p-3">{p.student}</td>
                <td className="p-3 font-mono">{p.week > 0 ? `Week ${p.week}` : "Not started"}</td>
                <td className="p-3">
                  <span className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    p.week > 0 ? "bg-green-500/10 text-green-600" : "bg-accent/10 text-accent"
                  }`}>
                    {p.week > 0 ? "Active" : "New"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPairing;
