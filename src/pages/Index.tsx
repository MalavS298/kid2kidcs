import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code2, BookOpen, Users, Monitor, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

const transition = { type: "tween" as const, ease: [0.2, 0, 0, 1] as [number, number, number, number], duration: 0.5 };

const Navbar = () =>
<nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
    <div className="container max-w-6xl mx-auto flex items-center justify-between h-14 px-4">
      <Link to="/" className="flex items-center gap-2 font-medium text-foreground">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
          <Code2 className="w-4 h-4 text-primary-foreground" />
        </div>
        <span>Kid2Kid <span className="text-accent">CS</span></span>
      </Link>
      <div className="hidden md:flex items-center gap-6 text-ui-sm text-muted-foreground">
        <a href="#about" className="hover:text-foreground transition-colors">About</a>
        <a href="#impact" className="hover:text-foreground transition-colors">Impact</a>
        <a href="#history" className="hover:text-foreground transition-colors">History</a>
      </div>
      <Link to="/login">
        <Button size="sm">Sign In</Button>
      </Link>
    </div>
  </nav>;


const HeroSection = () =>
<section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0">
      <img src={heroBg} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-foreground/60" />
    </div>
    <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
      <motion.h1
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition, delay: 0.2 }}
      className="text-hero font-medium tracking-tight leading-[1.1] text-primary-foreground mb-4">
      
        Where Kids Teach{" "}
        <span className="italic bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Kids to Code
        </span>
      </motion.h1>
      <motion.p
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition, delay: 0.3 }}
      className="text-primary-foreground/70 text-lg max-w-xl mx-auto mb-8">
      
        Join our 4-week computer science bootcamp. High school volunteers teaching others the fundamentals of Python in a fun, interactive environment.
      
    </motion.p>
      <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition, delay: 0.4 }}
      className="flex items-center justify-center gap-3">
      
        <Link to="/login">
          <Button variant="hero" size="lg">
            Join Now <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </motion.div>
    </div>
  </section>;


const features = [
{ icon: BookOpen, title: "4-Week Curriculum", desc: "A structured journey through Python fundamentals, from variables to loops and functions." },
{ icon: Users, title: "1-on-1 Mentorship", desc: "Personalized attention from experienced high school coders who understand the learning process." },
{ icon: Monitor, title: "Interactive Platform", desc: "Learn by doing with our built-in code editor and beautifully designed PDF guides." }];


const AboutSection = () =>
<section id="about" className="py-24 px-4">
    <div className="container max-w-4xl mx-auto text-center">
      <motion.h2
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={transition}
      className="text-section font-medium mb-4">
      
        Our Mission
      </motion.h2>
      <p className="text-muted-foreground max-w-2xl mx-auto mb-14">
        We believe every student deserves access to quality computer science education.
        By pairing passionate high school volunteers with younger students, we create a supportive peer-to-learning environment.
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((f, i) =>
      <motion.div
        key={f.title}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ ...transition, delay: i * 0.1 }}
        className="p-6 rounded-lg bg-card shadow-subtle text-left">
        
            <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center mb-4">
              <f.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-medium mb-2">{f.title}</h3>
            <p className="text-ui-sm text-muted-foreground">{f.desc}</p>
          </motion.div>
      )}
      </div>
    </div>
  </section>;


const stats = [
{ value: "500+", label: "Students Taught" },
{ value: "2,000+", label: "Volunteer Hours" },
{ value: "50k+", label: "Lines of Code" },
{ value: "12", label: "Partner Schools" }];


const ImpactSection = () =>
<section id="impact" className="py-24 px-4 bg-secondary/30">
    <div className="container max-w-4xl mx-auto text-center">
      <motion.h2
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={transition}
      className="text-section font-medium mb-4">
      
        Our Impact in Numbers
      </motion.h2>
      <p className="text-muted-foreground max-w-xl mx-auto mb-14">
        Since starting Kid2Kid CS, we've seen incredible growth in both our students' coding abilities and our volunteers' leadership skills.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) =>
      <motion.div
        key={s.label}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ ...transition, delay: i * 0.08 }}
        className="p-6 rounded-lg bg-card shadow-subtle">
        
            <div className="text-section font-medium font-mono text-primary">{s.value}</div>
            <div className="text-ui-sm text-muted-foreground mt-1">{s.label}</div>
          </motion.div>
      )}
      </div>
    </div>
  </section>;


const timeline = [
{ year: "2022", title: "The Idea", desc: "Founded by two high school students" },
{ year: "2023", title: "First Cohort", desc: "Launched pilot program with 20 students" },
{ year: "2024", title: "Going Digital", desc: "Built our custom learning platform" },
{ year: "2025", title: "Expansion", desc: "Reaching students nationwide" }];


const HistorySection = () =>
<section id="history" className="py-24 px-4">
    <div className="container max-w-3xl mx-auto text-center">
      <motion.h2
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={transition}
      className="text-section font-medium mb-14">
      
        How We Started
      </motion.h2>
      <div className="relative">
        <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-border" />
        <div className="space-y-12">
          {timeline.map((t, i) =>
        <motion.div
          key={t.year}
          initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ ...transition, delay: i * 0.1 }}
          className={`flex items-center gap-6 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
          
              <div className={`flex-1 ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                <div className="text-ui-sm font-mono text-primary">{t.year}</div>
                <div className="font-medium">{t.title}</div>
                <div className="text-ui-sm text-muted-foreground">{t.desc}</div>
              </div>
              <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-background z-10 shrink-0" />
              <div className="flex-1" />
            </motion.div>
        )}
        </div>
      </div>
    </div>
  </section>;


const Footer = () =>
<footer className="py-8 px-4 border-t border-border">
    <div className="container max-w-6xl mx-auto flex items-center justify-between text-ui-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Code2 className="w-4 h-4" />
        <span>Kid2Kid CS</span>
      </div>
      <span>© 2025 Kid2Kid CS. All rights reserved.</span>
    </div>
  </footer>;


const Index = () =>
<div className="min-h-screen">
    <Navbar />
    <HeroSection />
    <AboutSection />
    <ImpactSection />
    <HistorySection />
    <Footer />
  </div>;


export default Index;