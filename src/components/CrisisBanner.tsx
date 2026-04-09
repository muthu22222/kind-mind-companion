import { CRISIS_MESSAGE } from "@/lib/therapyEngine";
import { Phone, Heart, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

interface CrisisBannerProps {
  onDismiss: () => void;
}

export default function CrisisBanner({ onDismiss }: CrisisBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="crisis-banner mx-4 my-3"
    >
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert className="text-crisis" size={24} />
        <h3 className="font-bold text-lg text-foreground">{CRISIS_MESSAGE.title}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{CRISIS_MESSAGE.message}</p>

      <div className="space-y-2 mb-4">
        <h4 className="font-semibold text-sm flex items-center gap-1">
          <Phone size={14} /> Emergency Helplines (India)
        </h4>
        {CRISIS_MESSAGE.helplines.map((h) => (
          <div key={h.number} className="flex items-center justify-between bg-card rounded-lg px-3 py-2 border">
            <div>
              <p className="font-medium text-sm">{h.name}</p>
              <p className="text-xs text-muted-foreground">{h.hours}</p>
            </div>
            <a href={`tel:${h.number}`} className="font-semibold text-primary text-sm">{h.number}</a>
          </div>
        ))}
      </div>

      <div className="space-y-1 mb-4">
        <h4 className="font-semibold text-sm flex items-center gap-1">
          <Heart size={14} /> Immediate Steps
        </h4>
        {CRISIS_MESSAGE.steps.map((s, i) => (
          <p key={i} className="text-xs text-muted-foreground pl-4">
            {i + 1}. {s}
          </p>
        ))}
      </div>

      <button
        onClick={onDismiss}
        className="w-full text-center text-xs text-muted-foreground underline"
      >
        Continue to chat
      </button>
    </motion.div>
  );
}
