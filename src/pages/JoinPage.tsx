import { Link } from "react-router-dom";
import { Code2, GraduationCap, Heart, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const JoinPage = () => (
  <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex flex-col items-center justify-center px-4 py-16">
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center mb-12"
    >
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Join Kid2Kid CS</h1>
      <p className="text-muted-foreground text-lg max-w-md mx-auto">
        Choose how you'd like to be part of our community.
      </p>
    </motion.div>

    <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl mb-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
        <Link to="/join/student" className="block">
          <div className="rounded-2xl border border-border bg-card p-8 hover:shadow-card transition-all duration-200 group h-full">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
              <GraduationCap className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Become a Student</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5">
              Learn Python in our 4-week camp with a dedicated high school volunteer teacher.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
              Apply as Student <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}>
        <Link to="/join/volunteer" className="block">
          <div className="rounded-2xl border border-border bg-card p-8 hover:shadow-card transition-all duration-200 group h-full">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/15 transition-colors">
              <Heart className="w-7 h-7 text-accent" />
            </div>
            <h2 className="text-xl font-bold mb-2">Become a Volunteer</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5">
              Teach younger students Python and build your leadership skills as a high school volunteer.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent group-hover:gap-2.5 transition-all">
              Apply as Volunteer <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>
      </motion.div>
    </div>

    <p className="text-sm text-muted-foreground">
      Already have an account?{" "}
      <Link to="/login" className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors">
        Sign in
      </Link>
    </p>
  </div>
);

export default JoinPage;
