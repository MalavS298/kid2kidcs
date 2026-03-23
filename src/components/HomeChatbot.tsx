import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "bot";
  text: string;
}

const faq: Record<string, string> = {
  "what is kid2kid": "Kid2Kid CS is a free 4-week computer science program where high school volunteers teach middle school students the fundamentals of Python programming through 1-on-1 mentorship.",
  "how do i join": "Click the 'Join Now' button on the homepage! You can apply as either a student (middle schooler) or a volunteer teacher (high schooler).",
  "how much does it cost": "Kid2Kid CS is completely free! Our volunteers donate their time to make CS education accessible to everyone.",
  "what will i learn": "You'll learn Python programming over 4 weeks: Variables & Types, Conditionals, Loops, and Functions. Each week includes lessons, interactive notebooks, and coding exercises.",
  "who can volunteer": "High school students with Python experience can volunteer as teachers. You'll be paired 1-on-1 with a middle school student.",
  "how long is the program": "The program runs for 4 weeks with weekly 1-hour sessions between each student-teacher pair.",
  "what age": "Students should be in middle school (grades 6-8). Volunteer teachers should be in high school (grades 9-12).",
  "how do meetings work": "Once paired, you and your teacher/student will have weekly Zoom meetings scheduled through the platform.",
  "contact": "You can reach us at kid2kidcs@outlook.com for any questions!",
  "email": "You can reach us at kid2kidcs@outlook.com for any questions!",
};

const findAnswer = (input: string): string => {
  const lower = input.toLowerCase();
  for (const [key, answer] of Object.entries(faq)) {
    if (lower.includes(key)) return answer;
  }
  // Fuzzy matches
  if (lower.includes("cost") || lower.includes("price") || lower.includes("free") || lower.includes("pay")) return faq["how much does it cost"];
  if (lower.includes("join") || lower.includes("sign up") || lower.includes("apply") || lower.includes("register")) return faq["how do i join"];
  if (lower.includes("learn") || lower.includes("teach") || lower.includes("curriculum") || lower.includes("python")) return faq["what will i learn"];
  if (lower.includes("volunteer") || lower.includes("teacher") || lower.includes("tutor") || lower.includes("mentor")) return faq["who can volunteer"];
  if (lower.includes("long") || lower.includes("duration") || lower.includes("weeks") || lower.includes("time")) return faq["how long is the program"];
  if (lower.includes("age") || lower.includes("grade") || lower.includes("old") || lower.includes("middle") || lower.includes("high school")) return faq["what age"];
  if (lower.includes("meeting") || lower.includes("zoom") || lower.includes("session") || lower.includes("schedule")) return faq["how do meetings work"];
  if (lower.includes("contact") || lower.includes("email") || lower.includes("reach") || lower.includes("help") || lower.includes("question")) return faq["contact"];

  return "I'm not sure about that! Feel free to email us at kid2kidcs@outlook.com and we'll get back to you. 😊";
};

const HomeChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi there! 👋 I'm the Kid2Kid CS helper. Ask me anything about the program, or email us at kid2kidcs@outlook.com!" },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);

    // Simulate typing delay
    setTimeout(() => {
      const answer = findAnswer(userMsg);
      setMessages(prev => [...prev, { role: "bot", text: answer }]);
    }, 500);
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] h-[480px] rounded-2xl bg-card border border-border shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-primary text-primary-foreground flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <div>
                  <div className="font-semibold text-sm">Kid2Kid CS</div>
                  <div className="text-xs text-primary-foreground/70">Ask us anything!</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="hover:bg-primary-foreground/10 rounded-full p-1 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] px-3 py-2 rounded-xl text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary text-foreground rounded-bl-sm"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
              {["What is Kid2Kid?", "How do I join?", "Is it free?"].map(q => (
                <button
                  key={q}
                  onClick={() => {
                    setMessages(prev => [...prev, { role: "user", text: q }]);
                    setTimeout(() => {
                      setMessages(prev => [...prev, { role: "bot", text: findAnswer(q) }]);
                    }, 500);
                  }}
                  className="text-xs px-2.5 py-1 rounded-full border border-border hover:bg-secondary transition-colors text-muted-foreground"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-1 shrink-0">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder="Type your question..."
                  className="text-sm"
                />
                <Button size="icon" onClick={handleSend} disabled={!input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center justify-center gap-1 mt-2 text-[11px] text-muted-foreground">
                <Mail className="w-3 h-3" />
                <a href="mailto:kid2kidcs@outlook.com" className="hover:text-foreground transition-colors">kid2kidcs@outlook.com</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HomeChatbot;
