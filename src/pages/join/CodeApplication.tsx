import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code2, KeyRound, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CodeApplication = () => {
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventName, setEventName] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = code.trim().toUpperCase();
    if (entered.length < 4) {
      toast.error("Please enter your event code.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("in_person_events")
        .select("id, name, active")
        .ilike("code", entered)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data || !data.active) {
        toast.error("That code isn't valid. Double-check with your instructor.");
        return;
      }
      setEventId(data.id);
      setEventName(data.name);
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || "Could not check that code.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age || !email.trim()) {
      toast.error("Please fill out all fields.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;

      const { error: appError } = await supabase.from("applications").insert({
        type: "in_person",
        name: name.trim(),
        age: parseInt(age),
        email: email.trim(),
        availability: [],
        status: "approved",
        event_id: eventId,
        user_id: data.user?.id,
      } as any);
      if (appError) throw appError;

      localStorage.setItem(
        "k2k_user",
        JSON.stringify({
          email: email.trim(),
          role: "student",
          name: name.trim(),
          inPerson: true,
          eventId,
          eventName,
        })
      );
      toast.success(`You're in — welcome to ${eventName}!`);
      navigate("/student");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
            <Code2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-medium">Kid2Kid <span className="text-accent">CS</span></span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          {step === 1 ? (
            <form onSubmit={handleCode} className="space-y-5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">Join with a code</h1>
                <p className="text-muted-foreground text-sm">
                  Attending one of our in-person sessions? Enter the code your instructor gave you.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Event code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={12}
                  className="text-center text-2xl tracking-[0.4em] font-mono h-14 uppercase"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Continue
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                No code?{" "}
                <Link to="/join" className="underline underline-offset-4 hover:text-primary">Join online instead</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <span className="inline-block text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary mb-3">
                  {eventName}
                </span>
                <h1 className="text-2xl font-bold mb-1">Create your account</h1>
                <p className="text-muted-foreground text-sm">
                  You'll get instant access to the lessons and the Python sandbox.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Alex Chen" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" min={5} max={25} value={age} onChange={e => setAge(e.target.value)} placeholder="12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Start learning
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeApplication;
