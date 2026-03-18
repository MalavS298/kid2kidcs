import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Plus, User } from "lucide-react";

const assignedStudents = ["Alex Chen", "Sam Lee"];

const initialMeetings = [
  { id: 1, student: "Alex Chen", date: "2026-03-20", time: "15:00", duration: "1 hour", status: "scheduled" as const },
  { id: 2, student: "Sam Lee", date: "2026-03-21", time: "16:00", duration: "1 hour", status: "scheduled" as const },
  { id: 3, student: "Alex Chen", date: "2026-03-13", time: "15:00", duration: "1 hour", status: "completed" as const },
];

const TeacherMeetings = () => {
  const [meetings, setMeetings] = useState(initialMeetings);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ student: "", date: "", time: "" });

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setMeetings([...meetings, { id: Date.now(), ...form, duration: "1 hour", status: "scheduled" }]);
    setForm({ student: "", date: "", time: "" });
    setShowForm(false);
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-section font-medium mb-1">Meetings</h1>
          <p className="text-muted-foreground">Manage your lesson schedule.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="w-3 h-3" /> Schedule Lesson
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSchedule} className="rounded-lg bg-card shadow-subtle p-5 mb-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Student</Label>
              <Select value={form.student} onValueChange={v => setForm({ ...form, student: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {assignedStudents.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div>
              <Label>Time</Label>
              <Input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm">Confirm</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {meetings.map(m => (
          <div key={m.id} className="rounded-lg bg-card shadow-subtle p-4 flex items-center gap-4">
            <div className={`w-2 h-2 rounded-full shrink-0 ${m.status === "scheduled" ? "bg-accent" : "bg-green-500"}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2 text-ui-sm font-medium">
                <User className="w-3 h-3" /> {m.student}
              </div>
              <div className="flex items-center gap-3 text-[12px] text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {m.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {m.time}</span>
                <span>{m.duration}</span>
              </div>
            </div>
            <span className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
              m.status === "scheduled" ? "bg-accent/10 text-accent" : "bg-green-500/10 text-green-600"
            }`}>{m.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherMeetings;
