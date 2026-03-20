import { useState, useEffect } from "react";
import { Calendar, Clock, User, Video, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const StudentHome = () => {
  const user = JSON.parse(localStorage.getItem("k2k_user") || '{"name":"Student"}');
  const [nextMeeting, setNextMeeting] = useState<any>(null);
  const [loadingMeeting, setLoadingMeeting] = useState(true);

  useEffect(() => {
    const fetchNext = async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("meetings")
        .select("*")
        .eq("status", "scheduled")
        .gte("scheduled_date", today)
        .order("scheduled_date", { ascending: true })
        .limit(1);
      setNextMeeting(data?.[0] || null);
      setLoadingMeeting(false);
    };
    fetchNext();
  }, []);

  return (
    <div className="p-8 max-w-5xl">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary via-accent to-destructive p-6 mb-8 text-primary-foreground">
        <h1 className="text-2xl font-bold mb-1">Welcome back, {user.name}! 👋</h1>
        <p className="text-primary-foreground/80">Ready to write some awesome code today?</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Upcoming Sessions */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-bold mb-3">Upcoming Sessions</h2>
          <div className="rounded-xl bg-card shadow-subtle p-6 min-h-[140px] flex items-center justify-center">
            {loadingMeeting ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : nextMeeting ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Video className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="font-medium">{nextMeeting.scheduled_date}</div>
                    <div className="text-sm text-muted-foreground">{nextMeeting.scheduled_time} · {nextMeeting.teacher_name}</div>
                  </div>
                </div>
                {nextMeeting.zoom_join_url && (
                  <a href={nextMeeting.zoom_join_url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm">Join Zoom <ArrowRight className="w-3 h-3" /></Button>
                  </a>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-sm">No upcoming sessions scheduled.</p>
              </div>
            )}
          </div>
        </div>

        {/* Your Teacher */}
        <div>
          <h2 className="text-lg font-bold mb-3">Your Teacher</h2>
          <div className="rounded-xl bg-card shadow-subtle p-6 min-h-[140px] flex items-center justify-center">
            {nextMeeting?.teacher_name ? (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 text-primary font-bold">
                  {nextMeeting.teacher_name.split(" ").map((n: string) => n[0]).join("")}
                </div>
                <div className="font-medium">{nextMeeting.teacher_name}</div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <User className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-sm">You haven't been assigned a teacher yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-xl bg-card shadow-subtle p-6">
        <h3 className="font-bold mb-4">Your Progress</h3>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(w => (
            <div key={w} className="flex-1">
              <div className={`h-2 rounded-full ${w === 1 ? "bg-green-500" : w === 2 ? "bg-primary" : "bg-secondary"}`} />
              <div className="text-sm text-muted-foreground mt-1 text-center">Week {w}</div>
              <div className="text-[11px] text-center text-muted-foreground">
                {w === 1 ? "Complete" : w === 2 ? "In progress" : "Upcoming"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
