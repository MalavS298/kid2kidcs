import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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
  partnerName: string;
}

const DashboardChat = ({ currentName, currentRole, partnerName }: DashboardChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_name.eq.${currentName},receiver_name.eq.${partnerName}),and(sender_name.eq.${partnerName},receiver_name.eq.${currentName})`
      )
      .order("created_at", { ascending: true });
    if (data) {
      setMessages(data as ChatMessage[]);
      const unread = data.filter(
        (m: any) => m.receiver_name === currentName && !m.read
      ).length;
      setUnreadCount(unread);
    }
  };

  // Mark messages as read when opening
  const markAsRead = async () => {
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("receiver_name", currentName)
      .eq("sender_name", partnerName)
      .eq("read", false);
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentName, partnerName]);

  useEffect(() => {
    if (open) {
      markAsRead();
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [open, messages.length]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput("");
    await supabase.from("messages").insert({
      sender_name: currentName,
      sender_role: currentRole,
      receiver_name: partnerName,
      content: msg,
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-ui-sm text-muted-foreground hover:bg-secondary transition-colors relative">
          <MessageSquare className="w-4 h-4 shrink-0" />
          <span>Messages</span>
          {unreadCount > 0 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[440px] flex flex-col p-0">
        <SheetHeader className="px-5 py-4 border-b border-border shrink-0">
          <SheetTitle className="text-base">
            Chat with {partnerName || "your partner"}
          </SheetTitle>
        </SheetHeader>

        {!partnerName ? (
          <div className="flex-1 flex items-center justify-center text-center px-6">
            <div>
              <MessageSquare className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                You haven't been paired yet. Once an admin pairs you, you'll be able to message your {currentRole === "student" ? "teacher" : "student"} here.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-muted-foreground text-center">
                    No messages yet. Say hello to {partnerName}! 👋
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

            <div className="px-4 pb-4 pt-2 border-t border-border shrink-0">
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
      </SheetContent>
    </Sheet>
  );
};

export default DashboardChat;
