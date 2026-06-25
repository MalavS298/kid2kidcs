import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import wwLogo from "@/assets/ww-robotics-logo.png.asset.json";

export const WW_PROGRAM = "Westwood Robotics - Python";

const WWRoboticsApplication = () => {
  const [step, setStep] = useState(1); // 1 student, 2 parent, 3 account

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");

  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const goNextFromStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age || !email.trim()) return toast.error("Please fill out all fields.");
    setStep(2);
  };

  const goNextFromParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName.trim() || !parentEmail.trim() || !parentPhone.trim()) return toast.error("Please fill out all fields.");
    setStep(3);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;

      const parentInfo = `Parent: ${parentName} | Email: ${parentEmail} | Phone: ${parentPhone}`;
      const { error: appError } = await supabase.from("applications").insert({
        type: "student",
        name: name.trim(),
        age: parseInt(age),
        email: email.trim(),
        school: WW_PROGRAM,
        why_join: parentInfo,
        user_id: data.user?.id,
      });
      if (appError) throw appError;

      localStorage.setItem(
        "k2k_user",
        JSON.stringify({ email, role: "student", name, pending: true, program: WW_PROGRAM })
      );
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
      {[1, 2, 3].map((i, idx) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= i ? "bg-orange-500 text-white" : "bg-secondary text-muted-foreground"
            }`}
          >
            {i}
          </div>
          {idx < 2 && <div className={`flex-1 h-0.5 ${step > i ? "bg-orange-500" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500/10 via-background to-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <Link to="/" className="flex items-center justify-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-md bg-black flex items-center justify-center overflow-hidden">
            <img src={wwLogo.url} alt="Westwood Robotics" className="w-8 h-8 object-contain" />
          </div>
          <span className="text-xl font-medium">Westwood Robotics <span className="text-orange-500">Python</span></span>
        </Link>

        <div className="rounded-2xl bg-card shadow-subtle p-8 border border-orange-500/20">
          <StepIndicator />


          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold mb-1">Student Information</h2>
              <p className="text-sm text-muted-foreground mb-6">Tell us about yourself.</p>
              <form onSubmit={goNextFromStudent} className="space-y-5">
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
                <Button type="submit" className="w-full h-11 rounded-lg text-base bg-orange-500 hover:bg-orange-600 text-white">Continue</Button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold mb-1">Parent / Guardian Information</h2>
              <p className="text-sm text-muted-foreground mb-6">We'll use this to keep your parent in the loop.</p>
              <form onSubmit={goNextFromParent} className="space-y-5">
                <div>
                  <Label htmlFor="pname" className="font-semibold">Parent / Guardian Name</Label>
                  <Input id="pname" value={parentName} onChange={e => setParentName(e.target.value)} placeholder="Full name" className="mt-1.5" required />
                </div>
                <div>
                  <Label htmlFor="pemail" className="font-semibold">Parent Email</Label>
                  <Input id="pemail" type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} placeholder="parent@email.com" className="mt-1.5" required />
                </div>
                <div>
                  <Label htmlFor="pphone" className="font-semibold">Parent Phone</Label>
                  <Input id="pphone" value={parentPhone} onChange={e => setParentPhone(e.target.value)} placeholder="(555) 555-5555" className="mt-1.5" required />
                </div>
                <Button type="submit" className="w-full h-11 rounded-lg text-base bg-orange-500 hover:bg-orange-600 text-white">Continue</Button>
                <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">← Back</button>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold mb-1">Create Your Account</h2>
              <p className="text-sm text-muted-foreground mb-6">Set a password to complete your application.</p>
              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <Label className="font-semibold">Email</Label>
                  <Input value={email} disabled className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="password" className="font-semibold">Password</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" className="mt-1.5" required />
                </div>
                <Button type="submit" className="w-full h-11 rounded-lg text-base bg-orange-500 hover:bg-orange-600 text-white" disabled={loading}>
                  {loading ? "Submitting…" : "Submit Application"}
                </Button>
                <button type="button" onClick={() => setStep(2)} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">← Back</button>
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

export default WWRoboticsApplication;
