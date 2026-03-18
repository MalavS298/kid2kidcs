import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

const SettingsPanel = ({ open, onClose }: SettingsPanelProps) => {
  const user = JSON.parse(localStorage.getItem("k2k_user") || '{"name":"User","email":""}');
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...user, name: name.trim(), email: email.trim() };
    localStorage.setItem("k2k_user", JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 bg-foreground/20 z-40" onClick={onClose} />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: [0.2, 0, 0, 1] as [number, number, number, number], duration: 0.25 }}
            className="fixed top-0 right-0 bottom-0 w-96 max-w-full bg-card border-l border-border z-50 flex flex-col shadow-card"
          >
            <div className="h-14 flex items-center justify-between px-5 border-b border-border">
              <h2 className="font-medium">Settings</h2>
              <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <Label htmlFor="settings-name">Display Name</Label>
                <Input
                  id="settings-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <Label htmlFor="settings-email">Email</Label>
                <Input
                  id="settings-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  maxLength={255}
                  required
                />
              </div>

              <div className="border-t border-border pt-5">
                <p className="text-ui-sm font-medium mb-3">Change Password</p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="settings-current-pw">Current Password</Label>
                    <Input
                      id="settings-current-pw"
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      maxLength={128}
                    />
                  </div>
                  <div>
                    <Label htmlFor="settings-new-pw">New Password</Label>
                    <Input
                      id="settings-new-pw"
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      maxLength={128}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button type="submit" size="sm">Save Changes</Button>
                {saved && <span className="text-ui-sm text-green-600">Saved!</span>}
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
