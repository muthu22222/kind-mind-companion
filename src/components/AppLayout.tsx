import { NavLink, useLocation } from "react-router-dom";
import { MessageCircle, BarChart3, BookOpen, Activity, Wind, Settings, Menu, X, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";

const NAV_ITEMS = [
  { to: "/", icon: MessageCircle, label: "Chat" },
  { to: "/mood", icon: Activity, label: "Mood" },
  { to: "/journal", icon: BookOpen, label: "Journal" },
  { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { to: "/breathe", icon: Wind, label: "Breathe" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[72px] flex-col items-center py-5 gap-1 border-r glass-card rounded-none border-t-0 border-b-0 border-l-0">
        <div className="gradient-calm w-10 h-10 rounded-xl flex items-center justify-center mb-4 float-animation">
          <span className="text-primary-foreground font-bold text-sm">MB</span>
        </div>

        <div className="flex-1 flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-item p-2.5 ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`
              }
            >
              <Icon size={19} className="icon-hover" />
              <span className="text-[10px] leading-tight">{label}</span>
            </NavLink>
          ))}
        </div>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-300"
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          <motion.div
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </motion.div>
        </button>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-t-0 border-x-0 px-4 py-3 flex items-center justify-between">
        <div className="gradient-calm w-8 h-8 rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xs">MB</span>
        </div>
        <span className="font-semibold text-sm">MindBridge</span>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="text-muted-foreground p-1">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground">
            <motion.div key={mobileOpen ? "x" : "m"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.2 }}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-30 bg-foreground/10 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="md:hidden fixed top-14 left-2 right-2 z-40 glass-card p-2"
            >
              <div className="grid grid-cols-3 gap-1">
                {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium transition-all duration-250 ${
                      location.pathname === to ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon size={18} className="icon-hover" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 overflow-hidden md:pt-0 pt-14">
        {children}
      </main>
    </div>
  );
}
