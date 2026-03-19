import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Code2, GraduationCap, Heart, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const JoinPage = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
    <Link to="/" className="flex items-center gap-2 mb-10">
      <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
        <Code2 className="w-5 h-5 text-primary-foreground" />
      </div>
      <span className="text-xl font-medium">Kid2Kid <span className="text-accent">CS</span></span>
    </Link>

    <h1 className="text-3xl font-medium mb-2 text-center">Join Kid2Kid CS</h1>
    <p className="text-muted-foreground mb-10 text-center max-w-md">
      Choose how you'd like to be part of our community.
    </p>

    <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Link to="/join/student">
          <Card className="h-full hover:shadow-card transition-shadow cursor-pointer group">
            <CardHeader className="text-center pb-2">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                <GraduationCap className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-xl">Become a Student</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Learn Python fundamentals through our 4-week bootcamp with a dedicated high school mentor.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Link to="/join/volunteer">
          <Card className="h-full hover:shadow-card transition-shadow cursor-pointer group">
            <CardHeader className="text-center pb-2">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/20 transition-colors">
                <Heart className="w-7 h-7 text-accent" />
              </div>
              <CardTitle className="text-xl">Become a Volunteer</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Share your coding knowledge and mentor a younger student through their CS journey.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </div>

    <Link to="/" className="mt-8 text-ui-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
      <ArrowLeft className="w-3 h-3" /> Back to Home
    </Link>
  </div>
);

export default JoinPage;
