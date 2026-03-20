import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code2, ArrowLeft } from "lucide-react";

type Role = "student" | "teacher" | "admin";

const DEMO_ACCOUNTS: Record<string, { password: string; role: Role; name: string }> = {
  "student@kid2kid.com": { password: "student", role: "student", name: "Alex Chen" },
  "teacher@kid2kid.com": { password: "teacher", role: "teacher", name: "Jordan Smith" },
  "admin@kid2kid.com": { password: "admin", role: "admin", name: "Admin User" },
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const account = DEMO_ACCOUNTS[email];
    if (account && account.password === password) {
      localStorage.setItem("k2k_user", JSON.stringify({ email, role: account.role, name: account.name }));
      navigate(`/${account.role}`);
    } else {
      setError("Invalid credentials. Try one of the demo accounts below.");
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
              <Label htmlFor="email">Username</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g., student123" className="mt-1 rounded-lg bg-secondary/50 border-0" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 rounded-lg bg-secondary/50 border-0" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full rounded-full h-11 text-base">Sign In</Button>
          </form>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-secondary/50 text-sm">
          <p className="font-medium mb-2">Demo Accounts</p>
          <div className="space-y-1 text-muted-foreground font-mono text-xs">
            <p>student@kid2kid.com / student</p>
            <p>teacher@kid2kid.com / teacher</p>
            <p>admin@kid2kid.com / admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
