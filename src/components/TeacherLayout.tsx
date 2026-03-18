import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Code2, Home, Calendar, Users, LogOut, Settings } from "lucide-react";
import SettingsPanel from "@/components/SettingsPanel";

const TeacherLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("k2k_user");
    navigate("/");
  };

  const links = [
    { to: "/teacher", icon: Home, label: "Home" },
    { to: "/teacher/meetings", icon: Calendar, label: "Meetings" },
    { to: "/teacher/manage", icon: Users, label: "Manage" },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 h-screen sticky top-0 flex flex-col border-r border-border bg-sidebar">
        <div className="h-14 flex items-center px-4 border-b border-border gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <Code2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-medium text-ui-sm">Kid2Kid <span className="text-accent">CS</span></span>
          <span className="ml-auto text-[11px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent/10 text-accent">Teacher</span>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-ui-sm transition-colors",
              isActive(l.to) ? "bg-card shadow-subtle text-foreground border-l-2 border-primary" : "text-muted-foreground hover:bg-secondary"
            )}>
              <l.icon className="w-4 h-4" />
              <span>{l.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-border space-y-1">
          <button onClick={() => setSettingsOpen(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-ui-sm text-muted-foreground hover:bg-secondary transition-colors">
            <Settings className="w-4 h-4" /> Settings
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-ui-sm text-muted-foreground hover:bg-secondary transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
        <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </aside>
      <main className="flex-1 min-h-screen"><Outlet /></main>
    </div>
  );
};

export default TeacherLayout;
