import { useState, useEffect } from "react";
import { Users, Clock, BookOpen, TrendingUp, Check, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const metrics = [
  { icon: Users, label: "Total Students", value: "3", color: "text-primary", bg: "bg-primary/10" },
  { icon: Shield, label: "Total Teachers", value: "2", color: "text-[hsl(270,70%,55%)]", bg: "bg-[hsl(270,70%,55%)]/10" },
  { icon: Clock, label: "Hours Volunteered", value: "0", color: "text-[hsl(25,95%,53%)]", bg: "bg-[hsl(25,95%,53%)]/10" },
  { icon: Users, label: "Active Pairings", value: "0", color: "text-[hsl(160,84%,39%)]", bg: "bg-[hsl(160,84%,39%)]/10" },
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
      <h1 className="text-2xl font-bold mb-8">Admin Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {metrics.map((m, i) => (
          <div key={i} className="rounded-xl bg-card shadow-subtle p-5">
            <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center mb-3`}>
              <m.icon className={`w-5 h-5 ${m.color}`} />
            </div>
            <div className="text-3xl font-bold font-mono">{m.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Pending Applications */}
      <div className="rounded-xl bg-card shadow-subtle p-6 mb-8">
        <h3 className="font-bold mb-4">Pending Applications</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : applications.filter(a => a.status === "pending").length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending applications.</p>
        ) : (
          <div className="space-y-3">
            {applications.filter(a => a.status === "pending").map(app => (
              <div key={app.id} className="p-4 rounded-lg bg-secondary/50 space-y-2">
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                  <div>Age: {app.age}</div>
                  <div>Email: {app.email}</div>
                  {app.school && <div>School: {app.school}</div>}
                </div>
                {app.prior_experience && (
                  <div className="text-sm"><span className="font-medium">Experience:</span> {app.prior_experience}</div>
                )}
                {app.why_join && (
                  <div className="text-sm"><span className="font-medium">Why join:</span> {app.why_join}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviewed */}
      <div className="rounded-xl bg-card shadow-subtle p-6">
        <h3 className="font-bold mb-4">Reviewed Applications</h3>
        {applications.filter(a => a.status !== "pending").length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviewed applications yet.</p>
        ) : (
          <div className="space-y-3">
            {applications.filter(a => a.status !== "pending").map(app => (
              <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{app.name}</span>
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
