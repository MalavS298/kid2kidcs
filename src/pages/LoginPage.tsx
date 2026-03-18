import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code2 } from "lucide-react";

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
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
            <Code2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-medium">Kid2Kid <span className="text-accent">CS</span></span>
        </div>

        <div className="rounded-lg bg-card shadow-subtle p-6">
          <h2 className="text-xl font-medium mb-1">Sign In</h2>
          <p className="text-ui-sm text-muted-foreground mb-6">Enter your credentials to access the workbench</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="student@kid2kid.com" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {error && <p className="text-ui-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-secondary/50 text-ui-sm">
          <p className="font-medium mb-2">Demo Accounts</p>
          <div className="space-y-1 text-muted-foreground font-mono">
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
