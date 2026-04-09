import { motion } from "framer-motion";
import { Moon, Sun, Trash2, Shield, Heart, ExternalLink } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { storage } from "@/lib/storage";
import { useState } from "react";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [cleared, setCleared] = useState(false);

  const clearAllData = () => {
    storage.clearChats();
    localStorage.removeItem("mindbridge_moods");
    localStorage.removeItem("mindbridge_journals");
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  const sections = [
    {
      title: "Appearance",
      items: [
        {
          label: "Dark Mode",
          description: "Switch between light and dark themes",
          icon: theme === "dark" ? Moon : Sun,
          action: (
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${
                theme === "dark" ? "bg-primary" : "bg-muted"
              }`}
            >
              <motion.div
                animate={{ x: theme === "dark" ? 20 : 2 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute top-1 w-5 h-5 rounded-full bg-card shadow-md"
              />
            </button>
          ),
        },
      ],
    },
    {
      title: "Data & Privacy",
      items: [
        {
          label: "Clear All Data",
          description: "Remove all chats, moods, and journal entries",
          icon: Trash2,
          action: (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={clearAllData}
              className="px-4 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors duration-300"
            >
              {cleared ? "Cleared ✓" : "Clear"}
            </motion.button>
          ),
        },
        {
          label: "Privacy Policy",
          description: "All data is stored locally on your device",
          icon: Shield,
          action: (
            <span className="text-xs text-primary font-medium flex items-center gap-1">
              Local Only <ExternalLink size={10} />
            </span>
          ),
        },
      ],
    },
    {
      title: "About",
      items: [
        {
          label: "MindBridge",
          description: "AI-powered mental health companion with CBT & DBT techniques",
          icon: Heart,
          action: <span className="text-xs text-muted-foreground">v1.0</span>,
        },
      ],
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 max-w-lg mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Customize your experience</p>
      </motion.div>

      {sections.map((section, si) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + si * 0.08, duration: 0.4 }}
          className="space-y-2"
        >
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{section.title}</h3>
          <div className="glass-card divide-y divide-border overflow-hidden">
            {section.items.map((item, ii) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 + si * 0.08 + ii * 0.05 }}
                  className="flex items-center gap-3 p-4"
                >
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  {item.action}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-6"
      >
        <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xs mx-auto">
          ⚠️ <strong>Disclaimer:</strong> MindBridge is not a replacement for professional therapy. If you're experiencing a mental health emergency, please contact a licensed professional or call emergency services.
        </p>
      </motion.div>
    </div>
  );
}
