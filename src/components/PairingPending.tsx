import { Link, useNavigate } from "react-router-dom";
import { Code2, Clock, LogOut } from "lucide-react";

interface PairingPendingProps {
  name: string;
  email: string;
  role: "student" | "teacher";
}

const PairingPending = ({ name, email, role }: PairingPendingProps) => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("k2k_user");
    navigate("/");
  };

  const roleLabel = role === "teacher" ? "volunteer" : "student";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="h-14 border-b border-border flex items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <Code2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-medium">Kid2Kid <span className="text-accent">CS</span></span>
        </Link>
        <button onClick={handleSignOut} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>

          <h1 className="text-2xl font-bold mb-3">Pairing in Progress</h1>
          <p className="text-muted-foreground mb-2">
            Thank you for applying to {roleLabel}, {name}! Your application is being reviewed by our team.
          </p>
          <p className="text-muted-foreground mb-8">
            Once approved, you'll be paired with a {role === "teacher" ? "student" : "teacher"} and your dashboard will be fully unlocked.
          </p>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="font-semibold mb-1">What's next?</p>
            <p className="text-sm text-muted-foreground">
              An admin will review your application and reach out to you at{" "}
              <span className="font-semibold text-foreground">{email}</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PairingPending;
