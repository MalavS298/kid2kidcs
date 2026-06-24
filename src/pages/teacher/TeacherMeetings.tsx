import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Plus, User, Video, ExternalLink, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const assignedStudents = ["Alex Chen", "Sam Lee"];

type Meeting = {
  id: string;
  student_name: string;
  teacher_name: string;
  scheduled_date: string;
  scheduled_time: string;
  duration: string;
  status: string;
  zoom_join_url: string | null;
  zoom_start_url: string | null;
  zoom_meeting_id: string | null;
  zoom_password: string | null;
  teacher_joined: boolean;
  student_joined: boolean;
};

const TeacherMeetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ student: "", date: "", time: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { toast } = useToast();

  const fetchMeetings = async () => {
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .order("scheduled_date", { ascending: true });

    if (error) {
      console.error("Error fetching meetings:", error);
    } else {
      setMeetings(data || []);
    }
    setFetching(false);
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student || !form.date || !form.time) return;

    setLoading(true);
    try {
      const startTime = `${form.date}T${form.time}:00`;
      const { data, error } = await supabase.functions.invoke("create-google-meet", {
        body: {
          topic: `Kid2Kid CS - ${form.student}`,
          start_time: startTime,
          duration: 60,
          student_name: form.student,
          teacher_name: "Teacher",
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast({ title: "Meeting scheduled!", description: `Google Meet created for ${form.student}` });
      setForm({ student: "", date: "", time: "" });
      setShowForm(false);
      fetchMeetings();
    } catch (err: any) {
      console.error("Error scheduling:", err);
      toast({ title: "Error", description: err.message || "Failed to create meeting", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-section font-medium mb-1">Meetings</h1>
          <p className="text-muted-foreground">Manage your lesson schedule with Google Meet.</p>
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
            <Button type="submit" size="sm" disabled={loading}>
              {loading && <Loader2 className="w-3 h-3 animate-spin" />}
              {loading ? "Creating..." : "Confirm & Create Zoom"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {fetching ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading meetings...
        </div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No meetings scheduled yet. Click "Schedule Lesson" to create one.
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map(m => (
            <div key={m.id} className="rounded-lg bg-card shadow-subtle p-4 flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full shrink-0 ${m.status === "scheduled" ? "bg-accent" : "bg-green-500"}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-ui-sm font-medium">
                  <User className="w-3 h-3" /> {m.student_name}
                </div>
                <div className="flex items-center gap-3 text-[12px] text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {m.scheduled_date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {m.scheduled_time}</span>
                  <span>{m.duration}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {m.zoom_start_url && m.status === "scheduled" && (
                  <a href={m.zoom_start_url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Video className="w-3 h-3" /> Start <ExternalLink className="w-3 h-3" />
                    </Button>
                  </a>
                )}
                {m.status === "scheduled" && !m.teacher_joined && (
                  <Button size="sm" variant="outline" className="gap-1 text-primary border-primary/20" onClick={async () => {
                    await supabase.from("meetings").update({ teacher_joined: true } as any).eq("id", m.id);
                    // Check if student also joined → auto-complete
                    if (m.student_joined) {
                      await supabase.from("meetings").update({ status: "completed" } as any).eq("id", m.id);
                      toast({ title: "Meeting completed!", description: "Both attendees confirmed. Hours recorded." });
                    } else {
                      toast({ title: "Attendance marked", description: "Waiting for student to confirm attendance." });
                    }
                    fetchMeetings();
                  }}>
                    <Check className="w-3 h-3" /> Mark Attended
                  </Button>
                )}
                {m.teacher_joined && !m.student_joined && m.status === "scheduled" && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">Waiting for student</span>
                )}
                <span className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  m.status === "completed" ? "bg-green-500/10 text-green-600" : m.teacher_joined ? "bg-amber-500/10 text-amber-600" : "bg-accent/10 text-accent"
                }`}>{m.status === "completed" ? "verified ✓" : m.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherMeetings;
