import { useState } from "react";
import { Shield, Database, BarChart3, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import variesLogo from "@/assets/varies-logo.png";

interface AppShellProps {
  currentTeller: "one" | "two" | "three";
  onNavigate: (teller: "one" | "two" | "three") => void;
  onLogout: () => void;
  username: string;
  children: React.ReactNode;
}

const tellers = [
  { id: "one" as const, label: "Teller One", subtitle: "Authentication", icon: Shield },
  { id: "two" as const, label: "Teller Two", subtitle: "Database Engine", icon: Database },
  { id: "three" as const, label: "Teller Three", subtitle: "Analytics", icon: BarChart3 },
];

const AppShell = ({ currentTeller, onNavigate, onLogout, username, children }: AppShellProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className={`relative flex flex-col border-r border-border/50 bg-card/40 acrylic-blur transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-border/30">
          <img src={variesLogo} alt="VARIES" className="w-8 h-8 flex-shrink-0" />
          {!collapsed && (
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-primary tracking-wider">VARIES</h2>
              <p className="text-[10px] text-muted-foreground tracking-wider">VAULT ACCESSOR</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1 mt-2">
          {tellers.map((t) => {
            const active = currentTeller === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onNavigate(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left
                  ${active 
                    ? "bg-primary/10 border border-primary/20 text-primary" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"}`}
              >
                <t.icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-primary" : ""}`} />
                {!collapsed && (
                  <div>
                    <p className="text-xs font-medium">{t.label}</p>
                    <p className="text-[10px] text-muted-foreground">{t.subtitle}</p>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="p-3 border-t border-border/30">
          {!collapsed && (
            <p className="text-[10px] text-muted-foreground mb-2 px-2 truncate">
              Logged in as <span className="text-foreground">{username}</span>
            </p>
          )}
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors">
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
            {!collapsed && "Logout"}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AppShell;
