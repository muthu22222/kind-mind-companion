import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wind } from "lucide-react";

const PHASES = [
  { label: "Breathe In", duration: 4, color: "hsl(174, 62%, 40%)" },
  { label: "Hold", duration: 4, color: "hsl(200, 60%, 50%)" },
  { label: "Breathe Out", duration: 4, color: "hsl(220, 60%, 55%)" },
  { label: "Hold", duration: 4, color: "hsl(200, 60%, 50%)" },
];

export default function BreathingCircle() {
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          setPhase((p) => {
            const next = (p + 1) % 4;
            if (next === 0) setCycles((c) => c + 1);
            return next;
          });
          return PHASES[(phase + 1) % 4].duration;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isActive, phase]);

  const currentPhase = PHASES[phase];
  const scale = phase === 0 ? 1.6 : phase === 2 ? 1 : phase === 1 ? 1.6 : 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center gap-8 h-full px-6"
    >
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-2xl font-bold text-center">Box Breathing</h2>
        <p className="text-muted-foreground text-sm text-center max-w-md mt-2 leading-relaxed">
          A calming technique used by Navy SEALs. Focus on the circle and follow the rhythm.
        </p>
      </motion.div>

      <div className="relative flex items-center justify-center w-72 h-72">
        {/* Outer glow rings */}
        <motion.div
          animate={{ scale: isActive ? [1, 1.15, 1] : 1, opacity: isActive ? [0.15, 0.25, 0.15] : 0.1 }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-56 h-56 rounded-full border-2 border-primary/20"
        />
        <motion.div
          animate={{ scale: isActive ? [1, 1.25, 1] : 1, opacity: isActive ? [0.08, 0.15, 0.08] : 0.05 }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute w-64 h-64 rounded-full border border-primary/10"
        />

        {/* Main breathing circle */}
        <motion.div
          animate={{ scale }}
          transition={{ duration: currentPhase.duration, ease: [0.42, 0, 0.58, 1] }}
          className={`w-40 h-40 rounded-full gradient-calm ${isActive ? "breathing-glow" : ""}`}
        />
        <div className="absolute flex flex-col items-center">
          <motion.span
            key={isActive ? count : "ready"}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-primary-foreground font-bold text-4xl"
          >
            {isActive ? count : "—"}
          </motion.span>
          <motion.span
            key={isActive ? currentPhase.label : "ready-label"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 0.3 }}
            className="text-primary-foreground text-sm font-medium mt-1"
          >
            {isActive ? currentPhase.label : "Ready"}
          </motion.span>
        </div>
      </div>

      <motion.button
        onClick={() => {
          setIsActive(!isActive);
          if (!isActive) { setPhase(0); setCount(4); setCycles(0); }
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-8 py-3.5 btn-primary flex items-center gap-2"
      >
        <Wind size={18} />
        {isActive ? "Stop" : "Start Breathing"}
      </motion.button>

      {cycles > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground"
        >
          Cycles completed: <span className="font-semibold text-primary">{cycles}</span>
        </motion.p>
      )}
    </motion.div>
  );
}
