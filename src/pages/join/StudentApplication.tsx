import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const StudentApplication = () => {
  const [step, setStep] = useState<"info" | "account">("info");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInfoNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age || !email.trim()) {
      toast.error("Please fill out all fields.");
      return;
    }
    setStep("account");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;

      // Submit application
      const { error: appError } = await supabase.from("applications").insert({
        type: "student",
        name: name.trim(),
        age: parseInt(age),
        email: email.trim(),
        user_id: data.user?.id,
      });
      if (appError) throw appError;

      localStorage.setItem("k2k_user", JSON.stringify({ email, role: "student", name, pending: true }));
      toast.success("Application submitted! An admin will review it shortly.");
      navigate("/student");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
            <Code2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-medium">Kid2Kid <span className="text-accent">CS</span></span>
        </Link>

        <div className="rounded-lg bg-card shadow-subtle p-6">
          {step === "info" ? (
            <>
              <h2 className="text-xl font-medium mb-1">Student Application</h2>
              <p className="text-ui-sm text-muted-foreground mb-6">Tell us about yourself</p>
              <form onSubmit={handleInfoNext} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" min="5" max="18" value={age} onChange={e => setAge(e.target.value)} placeholder="Your age" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
                <Button type="submit" className="w-full">Next</Button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-medium mb-1">Create Your Account</h2>
              <p className="text-ui-sm text-muted-foreground mb-6">Set a password to complete your application</p>
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input value={email} disabled />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Submitting…" : "Submit Application"}
                </Button>
                <button type="button" onClick={() => setStep("info")} className="w-full text-ui-sm text-muted-foreground hover:text-foreground transition-colors">
                  ← Back
                </button>
              </form>
            </>
          )}
        </div>

        <Link to="/join" className="mt-6 flex items-center justify-center gap-1 text-ui-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to options
        </Link>
      </div>
    </div>
  );
};

export default StudentApplication;
