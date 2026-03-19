import { useState, useEffect } from "react";
import { Users, Clock, BookOpen, TrendingUp, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const metrics = [
  { icon: Users, label: "Total Students", value: "48", change: "+12 this month" },
  { icon: Users, label: "Total Teachers", value: "15", change: "+3 this month" },
  { icon: Clock, label: "Platform Hours", value: "320", change: "+45 this week" },
  { icon: BookOpen, label: "Sessions Completed", value: "186", change: "89% completion rate" },
];

type Application = {
  id: string;
  type: string;
  name: string;
  age: number;
  email: string;
  school: string | null;
  prior_experience: string | null;
  why_join: string | null;
  status: string;
  created_at: string;
};

const AdminDashboard = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    const { data } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    setApplications((data as Application[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchApplications(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) { toast.error("Failed to update."); return; }
    toast.success(`Application ${status}.`);
    fetchApplications();
  };

  return (
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

      {/* Applications */}
      <div className="rounded-lg bg-card shadow-subtle p-6 mb-8">
        <h3 className="font-medium mb-4">Pending Applications</h3>
        {loading ? (
          <p className="text-ui-sm text-muted-foreground">Loading…</p>
        ) : applications.filter(a => a.status === "pending").length === 0 ? (
          <p className="text-ui-sm text-muted-foreground">No pending applications.</p>
        ) : (
          <div className="space-y-3">
            {applications.filter(a => a.status === "pending").map(app => (
              <div key={app.id} className="p-4 rounded-md bg-secondary/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{app.name}</span>
                    <span className="ml-2 text-[11px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      {app.type}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => updateStatus(app.id, "approved")}>
                      <Check className="w-3 h-3 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/5" onClick={() => updateStatus(app.id, "rejected")}>
                      <X className="w-3 h-3 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-ui-sm text-muted-foreground">
                  <div>Age: {app.age}</div>
                  <div>Email: {app.email}</div>
                  {app.school && <div>School: {app.school}</div>}
                </div>
                {app.prior_experience && (
                  <div className="text-ui-sm"><span className="font-medium">Experience:</span> {app.prior_experience}</div>
                )}
                {app.why_join && (
                  <div className="text-ui-sm"><span className="font-medium">Why join:</span> {app.why_join}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past applications */}
      <div className="rounded-lg bg-card shadow-subtle p-6">
        <h3 className="font-medium mb-4">Reviewed Applications</h3>
        {applications.filter(a => a.status !== "pending").length === 0 ? (
          <p className="text-ui-sm text-muted-foreground">No reviewed applications yet.</p>
        ) : (
          <div className="space-y-3">
            {applications.filter(a => a.status !== "pending").map(app => (
              <div key={app.id} className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
                <div className="flex items-center gap-2">
                  <span className="text-ui-sm font-medium">{app.name}</span>
                  <span className="text-[11px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">{app.type}</span>
                </div>
                <span className={`text-[11px] uppercase tracking-wider px-1.5 py-0.5 rounded ${app.status === "approved" ? "bg-green-100 text-green-700" : "bg-destructive/10 text-destructive"}`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
