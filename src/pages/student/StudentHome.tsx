import { Calendar, Clock, User, Video, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const StudentHome = () => {
  const user = JSON.parse(localStorage.getItem("k2k_user") || '{"name":"Student"}');

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-section font-medium mb-2">Welcome back, {user.name}</h1>
      <p className="text-muted-foreground mb-8">Your workbench is ready. Pick up where you left off.</p>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg bg-card shadow-subtle p-5">
          <div className="flex items-center gap-2 text-ui-sm text-muted-foreground mb-2">
            <Calendar className="w-4 h-4" /> Current Week
          </div>
          <div className="text-2xl font-medium font-mono">Week 2</div>
          <div className="text-ui-sm text-muted-foreground">Conditionals</div>
        </div>
        <div className="rounded-lg bg-card shadow-subtle p-5">
          <div className="flex items-center gap-2 text-ui-sm text-muted-foreground mb-2">
            <Clock className="w-4 h-4" /> Next Session
          </div>
          <div className="text-2xl font-medium font-mono">Mar 20</div>
          <div className="text-ui-sm text-muted-foreground">3:00 PM - 4:00 PM</div>
        </div>
        <div className="rounded-lg bg-card shadow-subtle p-5">
          <div className="flex items-center gap-2 text-ui-sm text-muted-foreground mb-2">
            <User className="w-4 h-4" /> Your Teacher
          </div>
          <div className="text-2xl font-medium">Jordan S.</div>
          <div className="text-ui-sm text-muted-foreground">3 sessions completed</div>
        </div>
      </div>

      <div className="rounded-lg bg-card shadow-subtle p-5">
        <h3 className="font-medium mb-4">Your Progress</h3>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(w => (
            <div key={w} className="flex-1">
              <div className={`h-2 rounded-full ${w === 1 ? "bg-green-500" : w === 2 ? "bg-primary" : "bg-secondary"}`} />
              <div className="text-ui-sm text-muted-foreground mt-1 text-center">Week {w}</div>
              <div className="text-[11px] text-center text-muted-foreground">
                {w === 1 ? "Complete" : w === 2 ? "In progress" : "Upcoming"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Meeting Card */}
      <div className="rounded-lg bg-card shadow-subtle p-5 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center">
              <Video className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-medium">Upcoming Session</h3>
              <div className="flex items-center gap-3 text-ui-sm text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Mar 20, 2026</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 3:00 PM – 4:00 PM</span>
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> Jordan S.</span>
              </div>
            </div>
          </div>
          <Button size="sm">
            Join Meeting <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
