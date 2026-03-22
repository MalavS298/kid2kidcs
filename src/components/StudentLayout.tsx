import { useState, createContext, useContext } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Code2, Home, BookOpen, Calendar, ChevronDown, ChevronRight, FileText, Code, LogOut, Lock, Settings } from "lucide-react";
import SettingsPanel from "@/components/SettingsPanel";
import PairingPending from "@/components/PairingPending";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const weeks = [
  { id: 1, title: "Week 1: Variables & Types", pdf: "Introduction to Python", exercise: "Variable Swap" },
  { id: 2, title: "Week 2: Conditionals", pdf: "If/Else Statements", exercise: "Grade Calculator" },
  { id: 3, title: "Week 3: Loops", pdf: "For and While Loops", exercise: "Pattern Printer" },
  { id: 4, title: "Week 4: Functions", pdf: "Defining Functions", exercise: "Calculator App" },
];
// Context to share unlocked weeks across student pages
export const StudentContext = createContext<{ unlockedWeeks: number }>({ unlockedWeeks: 2 });
export const useStudentContext = () => useContext(StudentContext);

const StudentLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openWeek, setOpenWeek] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("k2k_user") || '{"name":"Student","email":""}');

  // In production, this comes from the DB (set by teacher). Using localStorage for demo.
  const [unlockedWeeks] = useState(() => {
    const stored = localStorage.getItem("k2k_unlocked_weeks");
    return stored ? parseInt(stored) : 2; // Default: weeks 1-2 unlocked
  });

  const handleLogout = () => {
    localStorage.removeItem("k2k_user");
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  if (user.pending) {
    return <PairingPending name={user.name} email={user.email} role="student" />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "h-screen sticky top-0 flex flex-col border-r border-border bg-sidebar transition-all duration-200",
        sidebarOpen ? "w-64" : "w-14"
      )}>
        <div className="h-14 flex items-center px-4 border-b border-border gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center shrink-0">
            <Code2 className="w-4 h-4 text-primary-foreground" />
          </div>
          {sidebarOpen && <span className="font-medium text-ui-sm">Kid2Kid <span className="text-accent">CS</span></span>}
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          <Link to="/student" className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-ui-sm transition-colors",
            isActive("/student") ? "bg-card shadow-subtle text-foreground border-l-2 border-primary" : "text-muted-foreground hover:bg-secondary"
          )}>
            <Home className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Home</span>}
          </Link>

          <Link to="/student/meetings" className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-ui-sm transition-colors",
            isActive("/student/meetings") ? "bg-card shadow-subtle text-foreground border-l-2 border-primary" : "text-muted-foreground hover:bg-secondary"
          )}>
            <Calendar className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Meetings</span>}
          </Link>

          {sidebarOpen && <div className="text-[11px] uppercase tracking-wider text-muted-foreground px-3 pt-4 pb-1">Weekly Plan</div>}

          {weeks.map(w => {
            const locked = w.id > unlockedWeeks;
            return (
            <div key={w.id}>
              <button
                onClick={() => !locked && setOpenWeek(openWeek === w.id ? null : w.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-md text-ui-sm transition-colors",
                  locked ? "text-muted-foreground/40 cursor-not-allowed" : "text-muted-foreground hover:bg-secondary"
                )}
              >
                {locked ? <Lock className="w-4 h-4 shrink-0" /> : <BookOpen className="w-4 h-4 shrink-0" />}
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">{`Week ${w.id}`}</span>
                    {locked ? (
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary text-muted-foreground/50">Locked</span>
                    ) : (
                      <motion.div animate={{ rotate: openWeek === w.id ? 90 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronRight className="w-3 h-3" />
                      </motion.div>
                    )}
                  </>
                )}
              </button>
              <AnimatePresence>
                {openWeek === w.id && !locked && sidebarOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-6 pl-3 border-l border-border space-y-1 py-1">
                      <Link
                        to={`/student/week/${w.id}/content`}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1.5 rounded-md text-ui-sm transition-colors",
                          isActive(`/student/week/${w.id}/content`) ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <FileText className="w-3 h-3" /> Content
                      </Link>
                      <Link
                        to={`/student/week/${w.id}/exercise`}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1.5 rounded-md text-ui-sm transition-colors",
                          isActive(`/student/week/${w.id}/exercise`) ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Code className="w-3 h-3" /> Exercise
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            );
          })}
        </nav>

        <div className="p-2 border-t border-border space-y-1">
          <button onClick={() => setSettingsOpen(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-ui-sm text-muted-foreground hover:bg-secondary transition-colors">
            <Settings className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Settings</span>}
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-ui-sm text-muted-foreground hover:bg-secondary transition-colors">
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
        <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </aside>

      <main className="flex-1 min-h-screen">
        <StudentContext.Provider value={{ unlockedWeeks }}>
          <Outlet />
        </StudentContext.Provider>
      </main>
    </div>
  );
};

export default StudentLayout;
