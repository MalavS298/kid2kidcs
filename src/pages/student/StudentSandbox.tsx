import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Save, Plus, Loader2, FlaskConical, Trash2, FileCode, Circle, RotateCcw } from "lucide-react";
import { usePyodide } from "@/hooks/usePyodide";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Snippet {
  id: string;
  title: string;
  code: string;
  updated_at: string;
}

const STARTER = `# Welcome to your Python sandbox!
# Write any code you want and click Run to test it.
# Click Save to share it with your teacher.

print("Hello, Kid2Kid!")
`;

const StudentSandbox = () => {
  const user = JSON.parse(localStorage.getItem("k2k_user") || '{"name":"Student"}');
  const { runCode, loading } = usePyodide();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState("Untitled");
  const [code, setCode] = useState(STARTER);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadSnippets = async () => {
    const { data, error } = await supabase
      .from("sandbox_snippets")
      .select("id, title, code, updated_at")
      .eq("student_name", user.name)
      .order("updated_at", { ascending: false });
    if (error) {
      console.error(error);
      return;
    }
    setSnippets(data || []);
  };

  useEffect(() => {
    loadSnippets();
  }, []);

  const handleNew = () => {
    setActiveId(null);
    setTitle("Untitled");
    setCode(STARTER);
    setOutput("");
  };

  const handleOpen = (s: Snippet) => {
    setActiveId(s.id);
    setTitle(s.title);
    setCode(s.code);
    setOutput("");
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput("Running…");
    try {
      const result = await runCode(code);
      setOutput(result || "(no output)");
    } catch (e: any) {
      setOutput(`[Error] ${e.message || e}`);
    } finally {
      setRunning(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please give your snippet a title.");
      return;
    }
    setSaving(true);
    try {
      // Look up paired teacher (best-effort via meetings table)
      const { data: m } = await supabase
        .from("meetings")
        .select("teacher_name")
        .eq("student_name", user.name)
        .limit(1)
        .maybeSingle();
      const teacher_name = m?.teacher_name || null;

      if (activeId) {
        const { error } = await supabase
          .from("sandbox_snippets")
          .update({ title: title.trim(), code, teacher_name })
          .eq("id", activeId);
        if (error) throw error;
        toast.success("Snippet updated — your teacher can see it.");
      } else {
        const { data, error } = await supabase
          .from("sandbox_snippets")
          .insert({ student_name: user.name, teacher_name, title: title.trim(), code })
          .select("id")
          .single();
        if (error) throw error;
        setActiveId(data.id);
        toast.success("Snippet saved — your teacher can see it.");
      }
      loadSnippets();
    } catch (e: any) {
      toast.error(e.message || "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this snippet?")) return;
    const { error } = await supabase.from("sandbox_snippets").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (activeId === id) handleNew();
    loadSnippets();
    toast.success("Deleted.");
  };

  // Tab key inserts spaces
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current!;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = code.substring(0, start) + "    " + code.substring(end);
      setCode(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <FlaskConical className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Python Sandbox</h1>
          <p className="text-sm text-muted-foreground">Experiment freely. Save snippets to share with your teacher.</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mt-6">
        {/* Snippet list */}
        <aside className="col-span-3 rounded-xl border border-border bg-card p-3 h-fit">
          <Button onClick={handleNew} size="sm" variant="outline" className="w-full mb-3">
            <Plus className="w-3.5 h-3.5 mr-1" /> New snippet
          </Button>
          <div className="space-y-1 max-h-[600px] overflow-y-auto">
            {snippets.length === 0 && (
              <p className="text-xs text-muted-foreground px-2 py-3 text-center">No saved snippets yet.</p>
            )}
            {snippets.map(s => (
              <div
                key={s.id}
                className={cn(
                  "group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors",
                  activeId === s.id ? "bg-primary/10 text-primary" : "hover:bg-secondary text-foreground"
                )}
              >
                <FileCode className="w-3.5 h-3.5 shrink-0" />
                <button onClick={() => handleOpen(s)} className="flex-1 text-left truncate">{s.title}</button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
                  aria-label="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Editor */}
        <section className="col-span-9 rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-secondary/40">
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={80}
              className="h-8 max-w-xs bg-background"
              placeholder="Snippet title"
            />
            <div className="ml-auto flex items-center gap-2">
              <Button onClick={handleRun} size="sm" variant="secondary" disabled={running || loading}>
                {running || loading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Play className="w-3.5 h-3.5 mr-1" />}
                {loading ? "Loading Python…" : "Run"}
              </Button>
              <Button onClick={handleSave} size="sm" disabled={saving}>
                {saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                Save
              </Button>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            className="w-full h-[420px] p-4 font-mono text-sm bg-background text-foreground outline-none resize-none border-b border-border"
          />

          <div className="bg-foreground/[0.03] dark:bg-foreground/[0.06]">
            <div className="px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">Output</div>
            <pre className="p-4 font-mono text-sm whitespace-pre-wrap min-h-[120px] max-h-[260px] overflow-auto">
{output || <span className="text-muted-foreground">Click Run to see output…</span>}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentSandbox;
