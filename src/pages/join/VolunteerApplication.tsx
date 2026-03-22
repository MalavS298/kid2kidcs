import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Code2, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VolunteerApplication = () => {
  const [step, setStep] = useState(1);
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
      toast.success("Application submitted!");
      navigate("/teacher");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center gap-0 mb-8">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>1</div>
      <div className={`flex-1 h-0.5 ${step >= 2 ? "bg-primary" : "bg-border"}`} />
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>2</div>
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
                <Heart className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">Volunteer Application</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">Volunteer Application</h2>
              <p className="text-sm text-muted-foreground mb-6">Tell us about yourself and why you want to join.</p>

              <form onSubmit={handleFormNext} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="font-semibold">Full Name</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="mt-1.5" required />
                  </div>
                  <div>
                    <Label htmlFor="age" className="font-semibold">Age</Label>
                    <Input id="age" type="number" min="13" max="19" value={age} onChange={e => setAge(e.target.value)} placeholder="Your age" className="mt-1.5" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="school" className="font-semibold">School</Label>
                  <Input id="school" value={school} onChange={e => setSchool(e.target.value)} placeholder="Your high school name" className="mt-1.5" required />
                </div>
                <div>
                  <Label htmlFor="email" className="font-semibold">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="mt-1.5" required />
                </div>
                <div>
                  <Label htmlFor="experience" className="font-semibold">Prior Experience</Label>
                  <Textarea id="experience" value={experience} onChange={e => setExperience(e.target.value)} placeholder="Describe any prior coding or teaching experience..." rows={3} className="mt-1.5" required />
                </div>
                <div>
                  <Label htmlFor="whyJoin" className="font-semibold">Why I Want to Join</Label>
                  <Textarea id="whyJoin" value={whyJoin} onChange={e => setWhyJoin(e.target.value)} placeholder="Tell us why you want to be a volunteer..." rows={3} className="mt-1.5" required />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-2">
                    <Checkbox id="ackTrue" checked={ackTrue} onCheckedChange={(v) => setAckTrue(v === true)} />
                    <Label htmlFor="ackTrue" className="text-sm leading-tight cursor-pointer">
                      I acknowledge that everything above is my true qualifications and details
                    </Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox id="ackCommit" checked={ackCommit} onCheckedChange={(v) => setAckCommit(v === true)} />
                    <Label htmlFor="ackCommit" className="text-sm leading-tight cursor-pointer">
                      I can commit a minimum of 1 hour a week with responsibilities of communicating with my student
                    </Label>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 rounded-lg text-base">Continue</Button>
              </form>
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
                <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                  ← Back to form
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

export default VolunteerApplication;
