import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code2, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AvailabilityPicker from "@/components/AvailabilityPicker";
import { emailAdminNewSignup } from "@/lib/notifyEmails";

const StudentApplication = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [availability, setAvailability] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInfoNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age || !email.trim()) {
      toast.error("Please fill out all fields.");
      return;
    }
    setStep(2);
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

      const { error: appError } = await supabase.from("applications").insert({
        type: "student",
        name: name.trim(),
        age: parseInt(age),
        email: email.trim(),
        availability,
        user_id: data.user?.id,
      } as any);
      if (appError) throw appError;

      emailAdminNewSignup("Student", { Name: name, Age: age, Email: email, Availability: availability.join(", ") });

      localStorage.setItem("k2k_user", JSON.stringify({ email, role: "student", name, pending: true }));
      toast.success("Application submitted!");
      navigate("/student");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center gap-0 mb-8">
      {[1, 2, 3].map((n, i) => (
        <div key={n} className="flex items-center flex-1 last:flex-none">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= n ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{n}</div>
          {i < 2 && <div className={`flex-1 h-0.5 mx-1 ${step > n ? "bg-primary" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <Link to="/" className="flex items-center justify-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
            <Code2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-medium">Kid2Kid <span className="text-accent">CS</span></span>
        </Link>

        <div className="rounded-2xl bg-card shadow-subtle p-8">
          <StepIndicator />

          {step === 1 ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Student Application</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">Student Application</h2>
              <p className="text-sm text-muted-foreground mb-6">Tell us about yourself.</p>

              <form onSubmit={handleInfoNext} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="font-semibold">Full Name</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="mt-1.5" required />
                  </div>
                  <div>
                    <Label htmlFor="age" className="font-semibold">Age</Label>
                    <Input id="age" type="number" min="5" max="18" value={age} onChange={e => setAge(e.target.value)} placeholder="Your age" className="mt-1.5" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="font-semibold">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="mt-1.5" required />
                </div>
                <Button type="submit" className="w-full h-11 rounded-lg text-base">Continue</Button>
              </form>
            </>
          ) : step === 2 ? (
            <>
              <h2 className="text-2xl font-bold mb-1">Your Availability</h2>
              <p className="text-sm text-muted-foreground mb-6">We use this to pair you with a volunteer whose schedule overlaps yours.</p>
              <AvailabilityPicker value={availability} onChange={setAvailability} />
              <div className="flex gap-3 mt-6">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>← Back</Button>
                <Button
                  type="button"
                  className="flex-1"
                  disabled={availability.length === 0}
                  onClick={() => setStep(3)}
                >
                  Continue
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-1">Create Your Account</h2>
              <p className="text-sm text-muted-foreground mb-6">Set a password to complete your application</p>
              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <Label className="font-semibold">Email</Label>
                  <Input value={email} disabled className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="password" className="font-semibold">Password</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" className="mt-1.5" required />
                </div>
                <Button type="submit" className="w-full h-11 rounded-lg text-base" disabled={loading}>
                  {loading ? "Submitting…" : "Submit Application"}
                </Button>
                <button type="button" onClick={() => setStep(2)} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                  ← Back to availability
                </button>
              </form>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/join" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to options
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentApplication;
