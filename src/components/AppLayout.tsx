import { NavLink, useLocation } from "react-router-dom";
import { MessageCircle, BarChart3, BookOpen, Activity, Wind, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { to: "/", icon: MessageCircle, label: "Chat" },
  { to: "/mood", icon: Activity, label: "Mood" },
  { to: "/journal", icon: BookOpen, label: "Journal" },
  { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { to: "/breathe", icon: Wind, label: "Breathe" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-20 flex-col items-center py-6 gap-2 border-r bg-card">
        <div className="gradient-calm w-10 h-10 rounded-xl flex items-center justify-center mb-6">
          <span className="text-primary-foreground font-bold text-sm">MB</span>
        </div>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-3 rounded-xl transition-all text-xs font-medium ${
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b px-4 py-3 flex items-center justify-between">
        <div className="gradient-calm w-8 h-8 rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xs">MB</span>
        </div>
        <span className="font-semibold text-sm">MindBridge</span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed top-14 left-0 right-0 z-40 bg-card border-b shadow-lg"
          >
            <div className="flex gap-1 p-3">
              {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-all ${
                    location.pathname === to ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 overflow-hidden md:pt-0 pt-14">
        {children}
      </main>
    </div>
  );
}
