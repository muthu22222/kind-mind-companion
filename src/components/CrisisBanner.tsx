import { CRISIS_MESSAGE } from "@/lib/therapyEngine";
import { Phone, Heart, ShieldAlert, X } from "lucide-react";
import { motion } from "framer-motion";

interface CrisisBannerProps {
  onDismiss: () => void;
}

export default function CrisisBanner({ onDismiss }: CrisisBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="crisis-banner mx-4 my-3 relative"
    >
      <button onClick={onDismiss} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors">
        <X size={16} />
      </button>

      <div className="flex items-center gap-2 mb-3">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <ShieldAlert className="text-crisis" size={24} />
        </motion.div>
        <h3 className="font-bold text-lg text-foreground">{CRISIS_MESSAGE.title}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{CRISIS_MESSAGE.message}</p>

      <div className="space-y-2 mb-4">
        <h4 className="font-semibold text-sm flex items-center gap-1.5">
          <Phone size={14} /> Emergency Helplines (India)
        </h4>
        {CRISIS_MESSAGE.helplines.map((h, i) => (
          <motion.div
            key={h.number}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="flex items-center justify-between glass-card p-3 !rounded-xl"
          >
            <div>
              <p className="font-medium text-sm">{h.name}</p>
              <p className="text-xs text-muted-foreground">{h.hours}</p>
            </div>
            <a href={`tel:${h.number}`} className="font-semibold text-primary text-sm hover:underline">{h.number}</a>
          </motion.div>
        ))}
      </div>

      <div className="space-y-1.5 mb-4">
        <h4 className="font-semibold text-sm flex items-center gap-1.5">
          <Heart size={14} /> Immediate Steps
        </h4>
        {CRISIS_MESSAGE.steps.map((s, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="text-xs text-muted-foreground pl-4 leading-relaxed"
          >
            {i + 1}. {s}
          </motion.p>
        ))}
      </div>

      <button onClick={onDismiss} className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors underline">
        Continue to chat
      </button>
    </motion.div>
  );
}
