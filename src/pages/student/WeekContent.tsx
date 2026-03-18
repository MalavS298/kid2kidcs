import { useParams } from "react-router-dom";
import { FileText } from "lucide-react";

const weekContent: Record<string, { title: string; topics: string[] }> = {
  "1": { title: "Variables & Types", topics: ["What is a variable?", "Data types: int, float, str, bool", "Type conversion", "Input/Output"] },
  "2": { title: "Conditionals", topics: ["Boolean expressions", "if / elif / else", "Nested conditionals", "Logical operators"] },
  "3": { title: "Loops", topics: ["for loops", "while loops", "break & continue", "Nested loops"] },
  "4": { title: "Functions", topics: ["Defining functions", "Parameters & return values", "Scope", "Built-in functions"] },
};

const WeekContent = () => {
  const { weekId } = useParams();
  const content = weekContent[weekId || "1"];

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-2 text-ui-sm text-muted-foreground mb-2">
        <FileText className="w-4 h-4" /> Week {weekId} Content
      </div>
      <h1 className="text-section font-medium mb-6">{content?.title}</h1>

      <div className="rounded-lg bg-card shadow-subtle p-6">
        <h3 className="font-medium mb-4">Session Topics</h3>
        <div className="space-y-3">
          {content?.topics.map((topic, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-secondary/50">
              <span className="text-ui-sm font-mono text-primary mt-0.5">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-ui-sm">{topic}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 rounded-md bg-primary/5 border border-primary/10 text-ui-sm text-muted-foreground">
          📄 PDF content would be displayed here using a PDF viewer. In production, this would load the session PDF for Week {weekId}.
        </div>
      </div>
    </div>
  );
};

export default WeekContent;
