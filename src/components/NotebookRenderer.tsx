import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Code, Loader2 } from "lucide-react";

interface NotebookCell {
  cell_type: "markdown" | "code" | "raw";
  source: string[];
  outputs?: Array<{
    output_type: string;
    text?: string[];
    data?: Record<string, string[]>;
  }>;
}

interface NotebookData {
  cells: NotebookCell[];
  metadata?: any;
}

const MarkdownCell = ({ source }: { source: string }) => (
  <div className="prose prose-sm dark:prose-invert max-w-none px-5 py-4">
    {source.split("\n").map((line, i) => {
      if (line.startsWith("# ")) return <h1 key={i} className="text-2xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
      if (line.startsWith("## ")) return <h2 key={i} className="text-xl font-semibold mt-3 mb-2">{line.slice(3)}</h2>;
      if (line.startsWith("### ")) return <h3 key={i} className="text-lg font-medium mt-2 mb-1">{line.slice(4)}</h3>;
      if (line.startsWith("- ")) return <li key={i} className="ml-4">{line.slice(2)}</li>;
      if (line.startsWith("```")) return null;
      if (line.trim() === "") return <br key={i} />;
      // Handle inline code
      const parts = line.split(/(`[^`]+`)/g);
      return (
        <p key={i} className="my-1">
          {parts.map((part, j) =>
            part.startsWith("`") && part.endsWith("`") ? (
              <code key={j} className="px-1.5 py-0.5 rounded bg-secondary text-sm font-mono">{part.slice(1, -1)}</code>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
        </p>
      );
    })}
  </div>
);

const CodeCell = ({ source, outputs }: { source: string; outputs?: NotebookCell["outputs"] }) => (
  <div className="border border-border rounded-lg overflow-hidden my-2 mx-4">
    <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 border-b border-border">
      <Code className="w-3 h-3 text-muted-foreground" />
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Python</span>
    </div>
    <pre className="px-4 py-3 bg-card overflow-x-auto">
      <code className="text-sm font-mono text-foreground">{source}</code>
    </pre>
    {outputs && outputs.length > 0 && (
      <div className="border-t border-border px-4 py-3 bg-secondary/30">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Output</div>
        <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">
          {outputs.map((o, i) => {
            if (o.text) return <span key={i}>{o.text.join("")}</span>;
            if (o.data?.["text/plain"]) return <span key={i}>{o.data["text/plain"].join("")}</span>;
            return null;
          })}
        </pre>
      </div>
    )}
  </div>
);

interface NotebookRendererProps {
  weekId: string;
}

const NotebookRenderer = ({ weekId }: NotebookRendererProps) => {
  const [notebook, setNotebook] = useState<NotebookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotebook = async () => {
      setLoading(true);
      setError(null);

      // Try to find a notebook for this week
      const { data: files } = await supabase.storage
        .from("notebooks")
        .list(`week-${weekId}`, { limit: 1 });

      if (!files || files.length === 0) {
        setError("No notebook uploaded for this week yet.");
        setLoading(false);
        return;
      }

      const { data } = supabase.storage
        .from("notebooks")
        .getPublicUrl(`week-${weekId}/${files[0].name}`);

      try {
        const response = await fetch(data.publicUrl);
        const nbData = await response.json();
        setNotebook(nbData);
      } catch {
        setError("Failed to load notebook.");
      }
      setLoading(false);
    };

    fetchNotebook();
  }, [weekId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading notebook...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-lg bg-secondary/50 text-center">
        <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    );
  }

  if (!notebook) return null;

  return (
    <div className="space-y-1">
      {notebook.cells.map((cell, i) => {
        const source = cell.source.join("");
        if (cell.cell_type === "markdown") return <MarkdownCell key={i} source={source} />;
        if (cell.cell_type === "code") return <CodeCell key={i} source={source} outputs={cell.outputs} />;
        return null;
      })}
    </div>
  );
};

export default NotebookRenderer;
