import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  sender_name: string;
  sender_role: string;
  receiver_name: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface DashboardChatProps {
  currentName: string;
  currentRole: "student" | "teacher";
  /** For student: their teacher's name. For teacher: ignored (fetched from pairings). */
  partnerName?: string;
}

const DashboardChat = ({ currentName, currentRole, partnerName }: DashboardChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [teacherName, setTeacherName] = useState<string>(partnerName || "");
  const [studentNames, setStudentNames] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Resolve circle (teacher + students) from pairings.
  const loadCircle = async () => {
    if (currentRole === "teacher") {
      const { data } = await supabase
        .from("pairings")
        .select("student_name")
        .eq("teacher_name", currentName);
      setStudentNames((data || []).map((p: any) => p.student_name));
      setTeacherName(currentName);
    } else {
      // student
      const { data } = await supabase
        .from("pairings")
        .select("teacher_name")
        .eq("student_name", currentName)
        .maybeSingle();
      setTeacherName((data as any)?.teacher_name || partnerName || "");
      setStudentNames([currentName]);
    }
  };

  const fetchMessages = async () => {
    if (!teacherName) return;
    // Group conversation = teacher <-> all students
    const participants = [teacherName, ...studentNames];
    if (participants.length < 2) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .in("sender_name", participants)
      .in("receiver_name", participants)
      .order("created_at", { ascending: true });
    if (!data) return;
    // Dedupe broadcasts: teacher messages get inserted once per student.
    // Key on (sender, content, created_at trimmed to second).
    const seen = new Set<string>();
    const filtered: ChatMessage[] = [];
    for (const m of data as ChatMessage[]) {
      // For the teacher's view, dedupe by sender+content+timestamp(sec).
      if (currentRole === "teacher") {
        const ts = new Date(m.created_at).toISOString().slice(0, 19);
        const k = `${m.sender_name}|${m.content}|${ts}`;
        if (seen.has(k)) continue;
        seen.add(k);
        filtered.push(m);
      } else {
        // Student only sees messages where they are sender or receiver.
        if (m.sender_name === currentName || m.receiver_name === currentName) {
          filtered.push(m);
        }
      }
    }
    setMessages(filtered);
    const unread = filtered.filter(
      (m) =>
        !m.read &&
        ((currentRole === "teacher" && m.receiver_name === currentName) ||
          (currentRole === "student" && m.receiver_name === currentName))
    ).length;
    setUnreadCount(unread);
  };

  const markAsRead = async () => {
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("receiver_name", currentName)
      .eq("read", false);
    setUnreadCount(0);
  };

  useEffect(() => {
    loadCircle();
  }, [currentName, currentRole, partnerName]);

  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => fetchMessages()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [teacherName, studentNames.join(",")]);

  useEffect(() => {
    if (open) {
      markAsRead();
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    }
  }, [open, messages.length]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput("");
    if (currentRole === "teacher") {
      // Broadcast to all paired students as one message.
      if (studentNames.length === 0) return;
      const rows = studentNames.map((s) => ({
        sender_name: currentName,
        sender_role: "teacher",
        receiver_name: s,
        content: msg,
      }));
      await supabase.from("messages").insert(rows);
    } else {
      if (!teacherName) return;
      await supabase.from("messages").insert({
        sender_name: currentName,
        sender_role: "student",
        receiver_name: teacherName,
        content: msg,
      });
    }
  };

  const headerLabel =
    currentRole === "teacher"
      ? studentNames.length > 0
        ? `Group chat · ${studentNames.join(", ")}`
        : "Your students"
      : `Chat with ${teacherName || "your volunteer"}`;

  const hasPartner =
    currentRole === "teacher" ? studentNames.length > 0 : !!teacherName;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors relative"
        >
          {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
          {!open && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[500px] rounded-2xl border border-border bg-card shadow-xl flex flex-col overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border bg-primary/5 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm text-foreground truncate">{headerLabel}</span>
            </div>

            {!hasPartner ? (
              <div className="flex-1 flex items-center justify-center text-center px-6 py-12">
                <div>
                  <MessageCircle className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    You haven't been paired yet. Once paired, you'll be able to message your{" "}
                    {currentRole === "student" ? "volunteer" : "students"} here.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-h-[340px]">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center py-12">
                      <p className="text-sm text-muted-foreground text-center">
                        No messages yet. Say hello! 👋
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMine = msg.sender_name === currentName;
                      return (
                        <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                          <div className={cn(
                            "max-w-[75%] px-3.5 py-2 rounded-xl text-sm",
                            isMine
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-secondary text-foreground rounded-bl-sm"
                          )}>
                            {!isMine && currentRole === "teacher" && (
                              <p className="text-[10px] font-medium text-muted-foreground mb-0.5">
                                {msg.sender_name}
                              </p>
                            )}
                            <p>{msg.content}</p>
                            <p className={cn(
                              "text-[10px] mt-1",
                              isMine ? "text-primary-foreground/60" : "text-muted-foreground"
                            )}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="px-4 pb-3 pt-2 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Type a message..."
                      className="text-sm"
                    />
                    <Button size="icon" onClick={handleSend} disabled={!input.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardChat;
