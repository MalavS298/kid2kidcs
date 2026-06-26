import { useEffect, useState } from "react";
import { Check, X, Users, ClipboardList, FlaskConical, FileCode, User as UserIcon, RefreshCw, Calendar, Clock, Plus, Video, ExternalLink, Loader2 } from "lucide-react";
import wwLogo from "@/assets/ww-robotics-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const WW_ADMIN_NAME = "Westwood Admin";

const PROGRAM = "Westwood Robotics - Python";

type Application = {
  id: string;
  type: string;
  name: string;
  age: number;
  email: string;
  school: string | null;
  why_join: string | null;
  status: string;
  created_at: string;
};

type Snippet = {
  id: string;
  student_name: string;
  title: string;
  code: string;
  updated_at: string;
};

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
  teacher_joined: boolean;
  student_joined: boolean;
};

type Tab = "accept" | "manage" | "meetings" | "sandbox";

const AdminWWRobotics = () => {
  const [tab, setTab] = useState<Tab>("accept");
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [active, setActive] = useState<Snippet | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: "", time: "" });
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("applications")
      .select("*")
      .eq("school", PROGRAM)
      .order("created_at", { ascending: false });
    setApps((data as Application[]) || []);
    setLoading(false);
  };

  const loadSnippets = async () => {
    const approvedNames = apps.filter(a => a.status === "approved").map(a => a.name);
    if (approvedNames.length === 0) {
      setSnippets([]);
      return;
    }
    const { data } = await supabase
      .from("sandbox_snippets")
      .select("id, student_name, title, code, updated_at")
      .in("student_name", approvedNames)
      .order("updated_at", { ascending: false });
    setSnippets(data || []);
    setActive(prev => (data || []).find(s => s.id === prev?.id) || (data || [])[0] || null);
  };

  const loadMeetings = async () => {
    const { data } = await supabase
      .from("meetings")
      .select("*")
      .eq("teacher_name", WW_ADMIN_NAME)
      .order("scheduled_date", { ascending: true });
    setMeetings((data as Meeting[]) || []);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (tab === "sandbox") loadSnippets(); }, [tab, apps]);
  useEffect(() => { if (tab === "meetings") loadMeetings(); }, [tab]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) return toast.error("Failed to update.");
    toast.success(`Application ${status}.`);
    load();
  };

  const scheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student || !form.date || !form.time) return;
    setCreating(true);
    try {
      const startTime = `${form.date}T${form.time}:00`;
      const { data, error } = await supabase.functions.invoke("create-google-meet", {
        body: {
          topic: `Westwood Robotics - ${form.student}`,
          start_time: startTime,
          duration: 60,
          student_name: form.student,
          teacher_name: WW_ADMIN_NAME,
        },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      toast.success(`Google Meet created for ${form.student}`);
      setForm({ student: "", date: "", time: "" });
      setShowForm(false);
      loadMeetings();
    } catch (err: any) {
      toast.error(err.message || "Failed to create meeting");
    } finally {
      setCreating(false);
    }
  };

  const markAdminAttended = async (m: Meeting) => {
    await supabase.from("meetings").update({ teacher_joined: true } as any).eq("id", m.id);
    if (m.student_joined) {
      await supabase.from("meetings").update({ status: "completed" } as any).eq("id", m.id);
      toast.success("Meeting completed. Hours recorded.");
    } else {
      toast.success("Attendance marked. Waiting for student.");
    }
    loadMeetings();
  };

  const pending = apps.filter(a => a.status === "pending");
  const approved = apps.filter(a => a.status === "approved");

  const tabs: { id: Tab; label: string; icon: typeof ClipboardList }[] = [
    { id: "accept", label: "Accept", icon: ClipboardList },
    { id: "manage", label: "Manage", icon: Users },
    { id: "meetings", label: "Meetings", icon: Calendar },
    { id: "sandbox", label: "Sandbox", icon: FlaskConical },
  ];

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-xl bg-black flex items-center justify-center overflow-hidden">
          <img src={wwLogo.url} alt="Westwood Robotics" className="w-9 h-9 object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Westwood Robotics – Python</h1>
          <p className="text-sm text-muted-foreground">Manage students enrolled through Westwood High School Robotics.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mt-6 mb-6 border-b border-border">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 border-b-2 -mb-px",
              tab === t.id ? "border-orange-500 text-orange-500" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "accept" && (
        <div className="rounded-xl bg-card shadow-subtle p-6">
          <h3 className="font-bold mb-4">Pending WW Robotics Applications</h3>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending applications.</p>
          ) : (
            <div className="space-y-3">
              {pending.map(app => (
                <div key={app.id} className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{app.name}</span>
                      <span className="ml-2 text-[11px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-500">
                        WW Robotics
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => updateStatus(app.id, "approved")}>
                        <Check className="w-3 h-3 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/5" onClick={() => updateStatus(app.id, "rejected")}>
                        <X className="w-3 h-3 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                    <div>Age: {app.age}</div>
                    <div className="md:col-span-2">Email: {app.email}</div>
                  </div>
                  {app.why_join && (
                    <div className="text-sm text-muted-foreground">{app.why_join}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "manage" && (
        <div className="rounded-xl bg-card shadow-subtle p-6">
          <h3 className="font-bold mb-4">Approved Students ({approved.length})</h3>
          {approved.length === 0 ? (
            <p className="text-sm text-muted-foreground">No approved students yet.</p>
          ) : (
            <div className="space-y-2">
              {approved.map(app => (
                <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-border">
                  <div>
                    <div className="text-sm font-medium">{app.name}</div>
                    <div className="text-xs text-muted-foreground">{app.email} · Age {app.age}</div>
                    {app.why_join && <div className="text-xs text-muted-foreground mt-0.5">{app.why_join}</div>}
                  </div>
                  <span className="text-[11px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-green-100 text-green-700">approved</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "meetings" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">Schedule and join Google Meet sessions for WW Robotics students. The admin runs every meeting.</p>
            <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-3 h-3 mr-1" /> Schedule Meeting
            </Button>
          </div>

          {showForm && (
            <form onSubmit={scheduleMeeting} className="rounded-xl bg-card shadow-subtle p-5 mb-6 space-y-4 border border-orange-500/20">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Student</Label>
                  <Select value={form.student} onValueChange={v => setForm({ ...form, student: v })}>
                    <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                    <SelectContent>
                      {approved.length === 0 ? (
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">No approved students yet.</div>
                      ) : approved.map(a => (
                        <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>
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
                <Button type="submit" size="sm" disabled={creating}>
                  {creating && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                  {creating ? "Creating..." : "Confirm & Create Meet"}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          )}

          {meetings.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No meetings scheduled yet.</div>
          ) : (
            <div className="space-y-3">
              {meetings.map(m => (
                <div key={m.id} className="rounded-lg bg-card shadow-subtle p-4 flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${m.status === "scheduled" ? "bg-orange-500" : "bg-green-500"}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <UserIcon className="w-3 h-3" /> {m.student_name}
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
                          <Video className="w-3 h-3" /> Join <ExternalLink className="w-3 h-3" />
                        </Button>
                      </a>
                    )}
                    {m.status === "scheduled" && !m.teacher_joined && (
                      <Button size="sm" variant="outline" className="gap-1 text-orange-600 border-orange-200" onClick={() => markAdminAttended(m)}>
                        <Check className="w-3 h-3" /> Mark Attended
                      </Button>
                    )}
                    {m.teacher_joined && !m.student_joined && m.status === "scheduled" && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">Waiting for student</span>
                    )}
                    <span className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      m.status === "completed" ? "bg-green-500/10 text-green-600" : m.teacher_joined ? "bg-amber-500/10 text-amber-600" : "bg-orange-500/10 text-orange-600"
                    }`}>{m.status === "completed" ? "verified ✓" : m.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {tab === "sandbox" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">Python snippets saved by approved WW Robotics students.</p>
            <Button onClick={loadSnippets} variant="outline" size="sm">
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
            </Button>
          </div>
          <div className="grid grid-cols-12 gap-4">
            <aside className="col-span-4 rounded-xl border border-border bg-card p-3 h-fit max-h-[560px] overflow-y-auto">
              {snippets.length === 0 ? (
                <p className="text-sm text-muted-foreground px-2 py-6 text-center">No snippets yet.</p>
              ) : (
                <div className="space-y-1">
                  {snippets.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setActive(s)}
                      className={cn(
                        "w-full text-left rounded-md px-3 py-2 transition-colors",
                        active?.id === s.id ? "bg-orange-500/10 border border-orange-500/30" : "hover:bg-secondary border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <FileCode className="w-3.5 h-3.5 text-orange-500" />
                        <span className="truncate">{s.title}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                        <UserIcon className="w-3 h-3" />
                        <span>{s.student_name}</span>
                        <span>·</span>
                        <span>{formatDistanceToNow(new Date(s.updated_at), { addSuffix: true })}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </aside>
            <section className="col-span-8 rounded-xl border border-border bg-card overflow-hidden">
              {active ? (
                <>
                  <div className="px-4 py-3 border-b border-border bg-secondary/40">
                    <div className="font-medium">{active.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      By {active.student_name} · updated {formatDistanceToNow(new Date(active.updated_at), { addSuffix: true })}
                    </div>
                  </div>
                  <pre className="p-4 font-mono text-sm bg-background whitespace-pre-wrap overflow-auto min-h-[360px] max-h-[560px]">
                    {active.code}
                  </pre>
                </>
              ) : (
                <div className="p-12 text-center text-sm text-muted-foreground">Select a snippet to view it.</div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWWRobotics;
