import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { KeyRound, Plus, Loader2, FileCode, Users, Copy, Power } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventRow { id: string; name: string; code: string; active: boolean; created_at: string; }
interface AppRow { id: string; name: string; email: string; age: number; event_id: string | null; created_at: string; }
interface Snippet { id: string; student_name: string; title: string; code: string; updated_at: string; }

const randomCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const AdminInPerson = () => {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [apps, setApps] = useState<AppRow[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState(randomCode());
  const [creating, setCreating] = useState(false);
  const [activeStudent, setActiveStudent] = useState<string | null>(null);
  const [openSnippet, setOpenSnippet] = useState<Snippet | null>(null);

  const load = async () => {
    const [{ data: ev }, { data: ap }, { data: sn }] = await Promise.all([
      supabase.from("in_person_events").select("*").order("created_at", { ascending: false }),
      supabase.from("applications").select("id, name, email, age, event_id, created_at").eq("type", "in_person").order("created_at", { ascending: false }),
      supabase.from("sandbox_snippets").select("id, student_name, title, code, updated_at").order("updated_at", { ascending: false }),
    ]);
    setEvents((ev as any) || []);
    setApps((ap as any) || []);
    setSnippets((sn as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createEvent = async () => {
    if (!newName.trim()) { toast.error("Give the event a name."); return; }
    setCreating(true);
    const { error } = await supabase.from("in_person_events").insert({ name: newName.trim(), code: newCode.trim().toUpperCase() } as any);
    setCreating(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Event created.");
    setNewName("");
    setNewCode(randomCode());
    load();
  };

  const toggleEvent = async (ev: EventRow) => {
    const { error } = await supabase.from("in_person_events").update({ active: !ev.active }).eq("id", ev.id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  const students = apps;
  const snippetsFor = (n: string) => snippets.filter(s => s.student_name === n);

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-1">In-Person Events</h1>
      <p className="text-muted-foreground mb-8">Create an event code, hand it out at the session, and watch students' work sync in live.</p>

      {/* Create */}
      <div className="rounded-xl border border-border bg-card p-6 mb-8">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> New event</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input placeholder="Event name (e.g. Westwood Library — Oct 12)" value={newName} onChange={e => setNewName(e.target.value)} />
          <Input className="sm:w-44 font-mono tracking-widest uppercase text-center" value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())} maxLength={12} />
          <Button onClick={createEvent} disabled={creating}>
            {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Create
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
      ) : (
        <>
          {/* Events */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {events.map(ev => (
              <div key={ev.id} className={cn("rounded-xl border p-5", ev.active ? "border-border bg-card" : "border-border bg-secondary/40 opacity-70")}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><KeyRound className="w-4 h-4 text-primary" /></div>
                  <button onClick={() => toggleEvent(ev)} className="text-[11px] uppercase tracking-wider px-2 py-1 rounded hover:bg-secondary flex items-center gap-1 text-muted-foreground">
                    <Power className="w-3 h-3" /> {ev.active ? "Active" : "Off"}
                  </button>
                </div>
                <p className="font-medium mb-2">{ev.name}</p>
                <button
                  onClick={() => { navigator.clipboard.writeText(ev.code); toast.success("Code copied."); }}
                  className="font-mono text-xl tracking-[0.3em] flex items-center gap-2 hover:text-primary transition-colors"
                >
                  {ev.code} <Copy className="w-3.5 h-3.5" />
                </button>
                <p className="text-xs text-muted-foreground mt-2">
                  {apps.filter(a => a.event_id === ev.id).length} student(s) joined
                </p>
              </div>
            ))}
            {events.length === 0 && <p className="text-muted-foreground text-sm">No events yet.</p>}
          </div>

          {/* Students + their code */}
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4" /> In-person students</h2>
          <div className="space-y-3">
            {students.length === 0 && <p className="text-muted-foreground text-sm">Nobody has joined with a code yet.</p>}
            {students.map(s => {
              const list = snippetsFor(s.name);
              const open = activeStudent === s.name;
              return (
                <div key={s.id} className="rounded-xl border border-border bg-card">
                  <button onClick={() => setActiveStudent(open ? null : s.name)} className="w-full flex items-center justify-between p-4 text-left">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-sm text-muted-foreground">{s.email} · age {s.age} · {events.find(e => e.id === s.event_id)?.name || "—"}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{list.length} saved file(s)</span>
                  </button>
                  {open && (
                    <div className="border-t border-border p-4 space-y-2">
                      {list.length === 0 && <p className="text-sm text-muted-foreground">No saved work yet.</p>}
                      {list.map(sn => (
                        <div key={sn.id}>
                          <button
                            onClick={() => setOpenSnippet(openSnippet?.id === sn.id ? null : sn)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-secondary transition-colors text-left"
                          >
                            <FileCode className="w-4 h-4 text-primary shrink-0" />
                            <span className="flex-1">{sn.title}</span>
                            <span className="text-xs text-muted-foreground">{new Date(sn.updated_at).toLocaleString()}</span>
                          </button>
                          {openSnippet?.id === sn.id && (
                            <pre className="mt-2 rounded-lg bg-[#0d1117] text-[#e6edf3] p-4 text-xs font-mono overflow-x-auto">{sn.code}</pre>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminInPerson;
