import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const PHASES = [
  { label: "Breathe In", duration: 4 },
  { label: "Hold", duration: 4 },
  { label: "Breathe Out", duration: 4 },
  { label: "Hold", duration: 4 },
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
    <div className="flex flex-col items-center justify-center gap-8 h-full">
      <h2 className="text-2xl font-bold">Box Breathing</h2>
      <p className="text-muted-foreground text-sm text-center max-w-md">
        A calming technique used by Navy SEALs. Focus on the circle and follow the instructions.
      </p>

      <div className="relative flex items-center justify-center w-64 h-64">
        <motion.div
          animate={{ scale }}
          transition={{ duration: currentPhase.duration, ease: "easeInOut" }}
          className="w-40 h-40 rounded-full gradient-calm opacity-80"
        />
        <div className="absolute flex flex-col items-center">
          <span className="text-primary-foreground font-bold text-3xl">{isActive ? count : "—"}</span>
          <span className="text-primary-foreground/80 text-sm font-medium">
            {isActive ? currentPhase.label : "Ready"}
          </span>
        </div>
      </div>

      <button
        onClick={() => {
          setIsActive(!isActive);
          if (!isActive) { setPhase(0); setCount(4); setCycles(0); }
        }}
        className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:opacity-90"
      >
        {isActive ? "Stop" : "Start Breathing"}
      </button>

      {cycles > 0 && (
        <p className="text-sm text-muted-foreground">
          Cycles completed: {cycles}
        </p>
      )}
    </div>
  );
}
