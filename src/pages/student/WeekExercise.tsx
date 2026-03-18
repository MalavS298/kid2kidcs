import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code, Play, RotateCcw } from "lucide-react";

const exercises: Record<string, { title: string; prompt: string; starter: string }> = {
  "1": { title: "Variable Swap", prompt: "Write code to swap the values of two variables a and b without using a third variable.", starter: "a = 5\nb = 10\n\n# Swap a and b below\n" },
  "2": { title: "Grade Calculator", prompt: "Write a program that takes a score (0-100) and prints the letter grade (A: 90+, B: 80+, C: 70+, D: 60+, F: below 60).", starter: "score = 85\n\n# Print the letter grade\n" },
  "3": { title: "Pattern Printer", prompt: "Write a program that prints a right triangle of stars with 5 rows.", starter: "# Print a right triangle\nfor i in range(1, 6):\n    pass  # Replace this\n" },
  "4": { title: "Calculator App", prompt: "Write a function that takes two numbers and an operator (+, -, *, /) and returns the result.", starter: "def calculate(a, b, op):\n    # Your code here\n    pass\n\nprint(calculate(10, 3, '+'))\n" },
};

const WeekExercise = () => {
  const { weekId } = useParams();
  const ex = exercises[weekId || "1"];
  const [code, setCode] = useState(ex?.starter || "");
  const [output, setOutput] = useState("");

  const handleRun = () => {
    setOutput("▶ Running...\n\n(Python execution would happen server-side.\nIn production, this connects to a sandboxed Python runtime.)");
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="h-14 flex items-center justify-between px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-accent" />
          <span className="font-medium text-ui-sm">Week {weekId}: {ex?.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setCode(ex?.starter || "")}>
            <RotateCcw className="w-3 h-3" /> Reset
          </Button>
          <Button size="sm" onClick={handleRun}>
            <Play className="w-3 h-3" /> Run
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Prompt */}
        <div className="w-80 border-r border-border p-6 overflow-y-auto bg-card">
          <h3 className="font-medium mb-2">{ex?.title}</h3>
          <p className="text-ui-sm text-muted-foreground">{ex?.prompt}</p>
        </div>

        {/* Editor + Output */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-[#0f172a] p-0">
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full h-full bg-transparent text-green-400 font-mono text-ui-sm p-6 resize-none outline-none leading-relaxed"
              spellCheck={false}
            />
          </div>
          <div className="h-40 border-t border-border bg-[#0f172a] p-4 font-mono text-ui-sm text-muted-foreground overflow-y-auto">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground/50 mb-2">Output</div>
            <pre className="text-green-400/70 whitespace-pre-wrap">{output || "Click 'Run' to execute your code"}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekExercise;
