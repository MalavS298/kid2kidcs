import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FlaskConical, FileCode, RefreshCw, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Snippet {
  id: string;
  student_name: string;
  title: string;
  code: string;
  updated_at: string;
}

const TeacherSandbox = () => {
  const user = JSON.parse(localStorage.getItem("k2k_user") || '{"name":"Teacher"}');
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [active, setActive] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    // Find paired students via meetings
    const { data: meetings } = await supabase
      .from("meetings")
      .select("student_name")
      .eq("teacher_name", user.name);
    const studentNames = Array.from(new Set((meetings || []).map(m => m.student_name)));

    // Snippets explicitly addressed to me, OR snippets from any paired student
    let query = supabase
      .from("sandbox_snippets")
      .select("id, student_name, title, code, updated_at")
      .order("updated_at", { ascending: false });

    if (studentNames.length > 0) {
      query = query.or(`teacher_name.eq.${user.name},student_name.in.(${studentNames.map(n => `"${n}"`).join(",")})`);
    } else {
      query = query.eq("teacher_name", user.name);
    }

    const { data, error } = await query;
    if (error) console.error(error);
    setSnippets(data || []);
    setActive(prev => (data || []).find(s => s.id === prev?.id) || (data || [])[0] || null);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // Realtime updates
    const channel = supabase
      .channel("sandbox_snippets_teacher")
      .on("postgres_changes", { event: "*", schema: "public", table: "sandbox_snippets" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <FlaskConical className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Student Sandbox</h1>
          <p className="text-sm text-muted-foreground">View Python snippets your students have saved.</p>
        </div>
        <Button onClick={load} variant="outline" size="sm">
          <RefreshCw className={cn("w-3.5 h-3.5 mr-1", loading && "animate-spin")} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-4 mt-6">
        <aside className="col-span-4 rounded-xl border border-border bg-card p-3 h-fit max-h-[640px] overflow-y-auto">
          {snippets.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground px-2 py-6 text-center">
              No saved snippets yet. They'll appear here as soon as a student saves one.
            </p>
          )}
          <div className="space-y-1">
            {snippets.map(s => (
              <button
                key={s.id}
                onClick={() => setActive(s)}
                className={cn(
                  "w-full text-left rounded-md px-3 py-2 transition-colors",
                  active?.id === s.id ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary border border-transparent"
                )}
              >
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <FileCode className="w-3.5 h-3.5 text-primary" />
                  <span className="truncate">{s.title}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span>{s.student_name}</span>
                  <span>·</span>
                  <span>{formatDistanceToNow(new Date(s.updated_at), { addSuffix: true })}</span>
                </div>
              </button>
            ))}
          </div>
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
              <pre className="p-4 font-mono text-sm bg-background whitespace-pre-wrap overflow-auto min-h-[420px] max-h-[640px]">
                {active.code}
              </pre>
            </>
          ) : (
            <div className="p-12 text-center text-sm text-muted-foreground">Select a snippet to view it.</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TeacherSandbox;
