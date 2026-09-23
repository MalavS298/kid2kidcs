import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code2, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_EMAILS = ["slingshotftc@gmail.com", "kid2kidcs@outlook.com"];

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (signInError) {
        setError("That email or password doesn't match an account.");
        return;
      }

      if (ADMIN_EMAILS.includes(cleanEmail)) {
        localStorage.setItem("k2k_user", JSON.stringify({ email: cleanEmail, role: "admin", name: "Admin" }));
        navigate("/admin");
        return;
      }

      const { data: app } = await supabase
        .from("applications")
        .select("type, name, status, event_id")
        .ilike("email", cleanEmail)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!app) {
        setError("We couldn't find an application for this account.");
        return;
      }

      const role = app.type === "volunteer" ? "teacher" : "student";
      localStorage.setItem(
        "k2k_user",
        JSON.stringify({
          email: cleanEmail,
          role,
          name: app.name,
          pending: app.status !== "approved",
          inPerson: app.type === "in_person",
          eventId: app.event_id ?? undefined,
        })
      );
      navigate(`/${role}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong signing in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Back button */}
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to website
        </Link>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg">
            <Code2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue your coding journey</p>
        </div>

        <div className="rounded-xl bg-card shadow-subtle p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1 rounded-lg bg-secondary/50 border-0" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 rounded-lg bg-secondary/50 border-0" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full rounded-full h-11 text-base">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Sign In
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/join" className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors">
            Join Kid2Kid CS
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
