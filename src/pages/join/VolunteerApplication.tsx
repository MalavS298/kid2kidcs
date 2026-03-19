import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Code2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VolunteerApplication = () => {
  const [step, setStep] = useState<"form" | "account">("form");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [school, setSchool] = useState("");
  const [email, setEmail] = useState("");
  const [experience, setExperience] = useState("");
  const [whyJoin, setWhyJoin] = useState("");
  const [ackTrue, setAckTrue] = useState(false);
  const [ackCommit, setAckCommit] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFormNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age || !school.trim() || !email.trim() || !experience.trim() || !whyJoin.trim()) {
      toast.error("Please fill out all fields.");
      return;
    }
    if (!ackTrue || !ackCommit) {
      toast.error("Please acknowledge both checkboxes.");
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

      const { error: appError } = await supabase.from("applications").insert({
        type: "volunteer",
        name: name.trim(),
        age: parseInt(age),
        email: email.trim(),
        school: school.trim(),
        prior_experience: experience.trim(),
        why_join: whyJoin.trim(),
        acknowledge_true_info: ackTrue,
        acknowledge_commitment: ackCommit,
        user_id: data.user?.id,
      });
      if (appError) throw appError;

      localStorage.setItem("k2k_user", JSON.stringify({ email, role: "teacher", name, pending: true }));
      toast.success("Application submitted! An admin will review it shortly.");
      navigate("/teacher");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
            <Code2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-medium">Kid2Kid <span className="text-accent">CS</span></span>
        </Link>

        <div className="rounded-lg bg-card shadow-subtle p-6">
          {step === "form" ? (
            <>
              <h2 className="text-xl font-medium mb-1">Volunteer Application</h2>
              <p className="text-ui-sm text-muted-foreground mb-6">Tell us about yourself and why you want to volunteer</p>
              <form onSubmit={handleFormNext} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" min="13" max="19" value={age} onChange={e => setAge(e.target.value)} placeholder="Age" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="school">School</Label>
                  <Input id="school" value={school} onChange={e => setSchool(e.target.value)} placeholder="Your school name" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
                <div>
                  <Label htmlFor="experience">Prior Experience</Label>
                  <Textarea id="experience" value={experience} onChange={e => setExperience(e.target.value)} placeholder="Describe your coding experience…" rows={3} required />
                </div>
                <div>
                  <Label htmlFor="whyJoin">Why I Want to Join</Label>
                  <Textarea id="whyJoin" value={whyJoin} onChange={e => setWhyJoin(e.target.value)} placeholder="Tell us why you want to be a volunteer…" rows={3} required />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-2">
                    <Checkbox id="ackTrue" checked={ackTrue} onCheckedChange={(v) => setAckTrue(v === true)} />
                    <Label htmlFor="ackTrue" className="text-ui-sm leading-tight cursor-pointer">
                      I acknowledge that everything above is my true qualifications and details
                    </Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox id="ackCommit" checked={ackCommit} onCheckedChange={(v) => setAckCommit(v === true)} />
                    <Label htmlFor="ackCommit" className="text-ui-sm leading-tight cursor-pointer">
                      I can commit a minimum of 1 hour a week with responsibilities of communicating with my student
                    </Label>
                  </div>
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
                <button type="button" onClick={() => setStep("form")} className="w-full text-ui-sm text-muted-foreground hover:text-foreground transition-colors">
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

export default VolunteerApplication;
