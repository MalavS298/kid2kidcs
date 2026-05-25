import { useState, useEffect } from "react";
import { Calendar, User, Video, ArrowRight, Loader2, Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

const PRESETS: { name: string; from: string; via?: string; to: string }[] = [
  { name: "Sunset",   from: "#6366f1", via: "#a855f7", to: "#ef4444" },
  { name: "Ocean",    from: "#0ea5e9", via: "#3b82f6", to: "#6366f1" },
  { name: "Forest",   from: "#10b981", via: "#14b8a6", to: "#06b6d4" },
  { name: "Candy",    from: "#ec4899", via: "#f43f5e", to: "#f97316" },
  { name: "Aurora",   from: "#8b5cf6", via: "#22d3ee", to: "#10b981" },
  { name: "Mono",     from: "#1e293b", via: "#475569", to: "#94a3b8" },
];

const STORAGE_KEY = "k2k_banner_gradient";

type Gradient = { from: string; via?: string; to: string };

const StudentHome = () => {
  const user = JSON.parse(localStorage.getItem("k2k_user") || '{"name":"Student"}');
  const [nextMeeting, setNextMeeting] = useState<any>(null);
  const [loadingMeeting, setLoadingMeeting] = useState(true);

  const [gradient, setGradient] = useState<Gradient>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return PRESETS[0];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gradient));
  }, [gradient]);

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

  const bannerStyle = {
    backgroundImage: gradient.via
      ? `linear-gradient(to right, ${gradient.from}, ${gradient.via}, ${gradient.to})`
      : `linear-gradient(to right, ${gradient.from}, ${gradient.to})`,
  };

  const isPresetActive = (p: Gradient) =>
    p.from === gradient.from && p.via === gradient.via && p.to === gradient.to;

  return (
    <div className="p-8 max-w-5xl">
      {/* Welcome banner */}
      <div
        style={bannerStyle}
        className="relative rounded-2xl p-6 mb-8 text-white overflow-hidden"
      >
        <h1 className="text-2xl font-bold mb-1">Welcome back, {user.name}! 👋</h1>
        <p className="text-white/85">Ready to write some awesome code today?</p>

        <Popover>
          <PopoverTrigger asChild>
            <button
              className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center transition-colors"
              aria-label="Customize banner color"
            >
              <Palette className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-4">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Presets</p>
                <div className="grid grid-cols-3 gap-2">
                  {PRESETS.map(p => (
                    <button
                      key={p.name}
                      onClick={() => setGradient(p)}
                      className="group relative h-12 rounded-lg ring-1 ring-border hover:ring-foreground/30 transition-all"
                      style={{ backgroundImage: `linear-gradient(to right, ${p.from}, ${p.via}, ${p.to})` }}
                      title={p.name}
                    >
                      {isPresetActive(p) && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Custom</p>
                <div className="grid grid-cols-3 gap-2">
                  {(["from", "via", "to"] as const).map(key => (
                    <label key={key} className="flex flex-col items-center gap-1 text-[11px] text-muted-foreground capitalize">
                      {key}
                      <input
                        type="color"
                        value={gradient[key] || "#ffffff"}
                        onChange={e =>
                          setGradient(g => ({ ...g, [key]: e.target.value }))
                        }
                        className="h-9 w-full rounded-md border border-border bg-transparent cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => setGradient(g => ({ from: g.from, to: g.to }))}
                  className="mt-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Remove middle color
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
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
