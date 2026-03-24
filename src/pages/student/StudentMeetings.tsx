import { useState, useEffect } from "react";
import { Calendar, Clock, User, Video, ExternalLink, Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Meeting = {
  id: string;
  student_name: string;
  teacher_name: string;
  scheduled_date: string;
  scheduled_time: string;
  duration: string;
  status: string;
  zoom_join_url: string | null;
  zoom_meeting_id: string | null;
  zoom_password: string | null;
  teacher_joined: boolean;
  student_joined: boolean;
};

const StudentMeetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMeetings = async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .order("scheduled_date", { ascending: true });

      if (error) console.error("Error fetching meetings:", error);
      else setMeetings(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMeetings(); }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-3xl flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading meetings...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-section font-medium mb-2">Meetings</h1>
      <p className="text-muted-foreground mb-8">Your scheduled sessions with your teacher.</p>

      {meetings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No meetings scheduled yet.
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map(m => (
            <div key={m.id} className="rounded-lg bg-card shadow-subtle p-5 flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full shrink-0 ${m.status === "scheduled" ? "bg-accent" : "bg-green-500"}`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ui-sm">{m.student_name} — Lesson</div>
                <div className="flex items-center gap-3 text-ui-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {m.scheduled_date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {m.scheduled_time}</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {m.teacher_name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {m.zoom_join_url && m.status === "scheduled" && (
                  <a href={m.zoom_join_url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="gap-1">
                      <Video className="w-3 h-3" /> Join <ExternalLink className="w-3 h-3" />
                    </Button>
                  </a>
                )}
                <span className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  m.status === "scheduled" ? "bg-accent/10 text-accent" : "bg-green-500/10 text-green-600"
                }`}>
                  {m.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentMeetings;
