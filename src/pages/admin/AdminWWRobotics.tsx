import { useEffect, useState } from "react";
import { Bot, Check, X, Users, ClipboardList, FlaskConical, FileCode, User as UserIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

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

type Tab = "accept" | "manage" | "sandbox";

const AdminWWRobotics = () => {
  const [tab, setTab] = useState<Tab>("accept");
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [active, setActive] = useState<Snippet | null>(null);

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

  useEffect(() => { load(); }, []);
  useEffect(() => { if (tab === "sandbox") loadSnippets(); }, [tab, apps]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) return toast.error("Failed to update.");
    toast.success(`Application ${status}.`);
    load();
  };

  const pending = apps.filter(a => a.status === "pending");
  const approved = apps.filter(a => a.status === "approved");

  const tabs: { id: Tab; label: string; icon: typeof Bot }[] = [
    { id: "accept", label: "Accept", icon: ClipboardList },
    { id: "manage", label: "Manage", icon: Users },
    { id: "sandbox", label: "Sandbox", icon: FlaskConical },
  ];

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-xl bg-orange-500 flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
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
