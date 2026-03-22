import { useParams } from "react-router-dom";
import { FileText, Lock } from "lucide-react";
import { useStudentContext } from "@/components/StudentLayout";
import NotebookRenderer from "@/components/NotebookRenderer";

const weekTitles: Record<string, string> = {
  "1": "Variables & Types",
  "2": "Conditionals",
  "3": "Loops",
  "4": "Functions",
};

const WeekContent = () => {
  const { weekId } = useParams();
  const { unlockedWeeks } = useStudentContext();
  const weekNum = parseInt(weekId || "1");

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
      <h1 className="text-2xl font-semibold mb-6">{weekTitles[weekId || "1"]}</h1>

      <div className="rounded-lg bg-card shadow-subtle overflow-hidden">
        <NotebookRenderer weekId={weekId || "1"} />
      </div>
    </div>
  );
};

export default WeekContent;
