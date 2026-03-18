import { Calendar, Clock, User } from "lucide-react";

const meetings = [
  { date: "Mar 20, 2026", time: "3:00 PM - 4:00 PM", teacher: "Jordan S.", topic: "Week 2: Conditionals", status: "upcoming" },
  { date: "Mar 13, 2026", time: "3:00 PM - 4:00 PM", teacher: "Jordan S.", topic: "Week 1: Variables & Types", status: "completed" },
];

const StudentMeetings = () => (
  <div className="p-8 max-w-3xl">
    <h1 className="text-section font-medium mb-2">Meetings</h1>
    <p className="text-muted-foreground mb-8">Your scheduled sessions with your teacher.</p>

    <div className="space-y-3">
      {meetings.map((m, i) => (
        <div key={i} className="rounded-lg bg-card shadow-subtle p-5 flex items-center gap-4">
          <div className={`w-2 h-2 rounded-full shrink-0 ${m.status === "upcoming" ? "bg-accent" : "bg-green-500"}`} />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-ui-sm">{m.topic}</div>
            <div className="flex items-center gap-3 text-ui-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {m.date}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {m.time}</span>
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {m.teacher}</span>
            </div>
          </div>
          <span className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
            m.status === "upcoming" ? "bg-accent/10 text-accent" : "bg-green-500/10 text-green-600"
          }`}>
            {m.status}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default StudentMeetings;
