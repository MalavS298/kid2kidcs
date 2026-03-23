import { useParams, Link } from "react-router-dom";
import { FileText, Lock, Code, BookOpen, CheckCircle2 } from "lucide-react";
import { useStudentContext } from "@/components/StudentLayout";
import NotebookRenderer from "@/components/NotebookRenderer";
import { Button } from "@/components/ui/button";

const weekData: Record<string, { title: string; objectives: string[]; topics: string[] }> = {
  "1": {
    title: "Variables & Types",
    objectives: ["Understand what variables are", "Learn Python's basic data types", "Practice creating and using variables"],
    topics: ["Strings", "Integers & Floats", "Booleans", "Variable assignment", "The print() function"],
  },
  "2": {
    title: "Conditionals",
    objectives: ["Write if/elif/else statements", "Use comparison operators", "Combine conditions with and/or"],
    topics: ["if statements", "elif and else", "Comparison operators", "Logical operators", "Nested conditionals"],
  },
  "3": {
    title: "Loops",
    objectives: ["Use for and while loops", "Understand range()", "Control loop flow with break/continue"],
    topics: ["for loops", "while loops", "range() function", "break and continue", "Nested loops"],
  },
  "4": {
    title: "Functions",
    objectives: ["Define and call functions", "Understand parameters and return values", "Write reusable code"],
    topics: ["def keyword", "Parameters & arguments", "Return values", "Default parameters", "Scope"],
  },
};

const WeekContent = () => {
  const { weekId } = useParams();
  const { unlockedWeeks } = useStudentContext();
  const weekNum = parseInt(weekId || "1");
  const week = weekData[weekId || "1"];

  if (weekNum > unlockedWeeks) {
    return (
      <div className="p-8 max-w-3xl flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Lock className="w-10 h-10 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-medium mb-2">Week {weekId} is Locked</h2>
        <p className="text-muted-foreground text-sm">Your teacher hasn't unlocked this week yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <FileText className="w-4 h-4" /> Week {weekId} Content
      </div>
      <h1 className="text-2xl font-semibold mb-6">{week?.title}</h1>

      {/* Lesson Plan Overview */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="rounded-xl bg-card shadow-subtle border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Learning Objectives</h3>
          </div>
          <ul className="space-y-2">
            {week?.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {obj}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-card shadow-subtle border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <Code className="w-4 h-4 text-accent" />
            <h3 className="font-semibold text-sm">Topics Covered</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {week?.topics.map((topic, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-secondary text-xs font-medium text-muted-foreground">
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Notebook */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Lesson Notebook</h2>
        <div className="rounded-lg bg-card shadow-subtle overflow-hidden border border-border">
          <NotebookRenderer weekId={weekId || "1"} />
        </div>
      </div>

      {/* CTA to exercise */}
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold mb-1">Ready to practice?</h3>
          <p className="text-sm text-muted-foreground">Test your knowledge with the Week {weekId} exercise.</p>
        </div>
        <Link to={`/student/week/${weekId}/exercise`}>
          <Button>
            <Code className="w-4 h-4" /> Start Exercise
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default WeekContent;
