import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code, Play, RotateCcw, Circle, Lock } from "lucide-react";
import { useStudentContext } from "@/components/StudentLayout";

const exercises: Record<string, { title: string; prompt: string; starter: string }> = {
  "1": { title: "Variable Swap", prompt: "Write code to swap the values of two variables a and b without using a third variable.", starter: "a = 5\nb = 10\n\n# Swap a and b below\n" },
  "2": { title: "Grade Calculator", prompt: "Write a program that takes a score (0-100) and prints the letter grade (A: 90+, B: 80+, C: 70+, D: 60+, F: below 60).", starter: "score = 85\n\n# Print the letter grade\n" },
  "3": { title: "Pattern Printer", prompt: "Write a program that prints a right triangle of stars with 5 rows.", starter: "# Print a right triangle\nfor i in range(1, 6):\n    pass  # Replace this\n" },
  "4": { title: "Calculator App", prompt: "Write a function that takes two numbers and an operator (+, -, *, /) and returns the result.", starter: "def calculate(a, b, op):\n    # Your code here\n    pass\n\nprint(calculate(10, 3, '+'))\n" },
};

const LineNumbers = ({ count }: { count: number }) => (
  <div className="select-none text-right pr-4 pt-5 pb-5 pl-4 text-muted-foreground/30 font-mono text-ui-sm leading-relaxed">
    {Array.from({ length: count }, (_, i) => (
      <div key={i}>{i + 1}</div>
    ))}
  </div>
);

const WeekExercise = () => {
  const { weekId } = useParams();
  const ex = exercises[weekId || "1"];
  const [code, setCode] = useState(ex?.starter || "");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const lineCount = Math.max(code.split("\n").length, 12);

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setOutput("▶ Running...\n\n(Python execution would happen server-side.\nIn production, this connects to a sandboxed Python runtime.)");
      setIsRunning(false);
    }, 600);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="h-12 flex items-center justify-between px-5 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-accent" />
          <span className="font-medium text-ui-sm">Week {weekId}: {ex?.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setCode(ex?.starter || "")}>
            <RotateCcw className="w-3 h-3" /> Reset
          </Button>
          <Button size="sm" onClick={handleRun} disabled={isRunning}>
            <Play className="w-3 h-3" /> {isRunning ? "Running..." : "Run"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Prompt panel */}
        <div className="w-72 border-r border-border p-5 overflow-y-auto bg-card">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground/60 mb-3">Exercise</div>
          <h3 className="font-medium mb-3">{ex?.title}</h3>
          <p className="text-ui-sm text-muted-foreground leading-relaxed">{ex?.prompt}</p>
        </div>

        {/* Editor area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Editor card */}
          <div className="flex-1 p-3 min-h-0">
            <div className="h-full rounded-lg overflow-hidden" style={{
              backgroundColor: "#1e293b",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06), 0 4px 12px rgba(0,0,0,0.3)"
            }}>
              {/* Editor title bar */}
              <div className="flex items-center justify-between px-4 py-2.5" style={{ backgroundColor: "#162032" }}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ef4444" }} />
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#22c55e" }} />
                  </div>
                  <span className="text-[12px] font-mono ml-2" style={{ color: "#94a3b8" }}>exercise.py</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Circle className="w-2 h-2" style={{ color: code !== ex?.starter ? "#22c55e" : "#475569" }} fill={code !== ex?.starter ? "#22c55e" : "transparent"} />
                  <span className="text-[11px]" style={{ color: "#475569" }}>{code !== ex?.starter ? "modified" : "saved"}</span>
                </div>
              </div>
              {/* Code area */}
              <div className="flex overflow-auto h-[calc(100%-36px)]">
                <LineNumbers count={lineCount} />
                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="flex-1 bg-transparent font-mono text-ui-sm pt-5 pb-5 pr-5 resize-none outline-none leading-relaxed"
                  style={{ color: "#e2e8f0", caretColor: "#38bdf8" }}
                  spellCheck={false}
                />
              </div>
            </div>
          </div>

          {/* Output panel */}
          <div className="h-36 px-3 pb-3">
            <div className="h-full rounded-lg overflow-hidden" style={{
              backgroundColor: "#0f172a",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)"
            }}>
              <div className="flex items-center gap-2 px-4 py-2" style={{ backgroundColor: "#0c1322" }}>
                <span className="text-[11px] uppercase tracking-wider font-mono" style={{ color: "#475569" }}>Output</span>
              </div>
              <pre className="px-4 py-3 font-mono text-ui-sm overflow-auto h-[calc(100%-32px)] whitespace-pre-wrap" style={{ color: "#4ade80" }}>
                {output || "Click 'Run' to execute your code"}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekExercise;
