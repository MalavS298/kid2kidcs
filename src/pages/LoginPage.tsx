import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code2, ArrowLeft } from "lucide-react";
import { lovable } from "@/integrations/lovable";

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

  const handleGoogleSignIn = async () => {
    setError("");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(result.error.message || "Google sign-in failed.");
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

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="chrome-border-wrapper rounded-full p-[2px]">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full rounded-full h-11 text-base gap-2 border-0 bg-card"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
              </svg>
              Continue with Google
            </Button>
          </div>
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
