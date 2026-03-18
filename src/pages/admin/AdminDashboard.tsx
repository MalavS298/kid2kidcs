import { Users, Clock, BookOpen, TrendingUp } from "lucide-react";

const metrics = [
  { icon: Users, label: "Total Students", value: "48", change: "+12 this month" },
  { icon: Users, label: "Total Teachers", value: "15", change: "+3 this month" },
  { icon: Clock, label: "Platform Hours", value: "320", change: "+45 this week" },
  { icon: BookOpen, label: "Sessions Completed", value: "186", change: "89% completion rate" },
];

const AdminDashboard = () => (
  <div className="p-8 max-w-5xl">
    <h1 className="text-section font-medium mb-2">Admin Dashboard</h1>
    <p className="text-muted-foreground mb-8">Bird's-eye view of the Kid2Kid CS platform.</p>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {metrics.map((m, i) => (
        <div key={i} className="rounded-lg bg-card shadow-card p-5">
          <div className="flex items-center gap-2 text-ui-sm text-muted-foreground mb-3">
            <m.icon className="w-4 h-4" />
            {m.label}
          </div>
          <div className="text-3xl font-medium font-mono text-primary">{m.value}</div>
          <div className="text-[12px] text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-500" /> {m.change}
          </div>
        </div>
      ))}
    </div>

    <div className="rounded-lg bg-card shadow-subtle p-6">
      <h3 className="font-medium mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {[
          { action: "Alex Chen completed Week 1 exercise", time: "2 hours ago" },
          { action: "Jordan Smith scheduled a session with Sam Lee", time: "5 hours ago" },
          { action: "New student Maya Johnson signed up", time: "1 day ago" },
          { action: "Teacher David Park logged 3 volunteer hours", time: "1 day ago" },
        ].map((a, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
            <span className="text-ui-sm">{a.action}</span>
            <span className="text-[12px] text-muted-foreground shrink-0 ml-4">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default AdminDashboard;
