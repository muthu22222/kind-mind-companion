import { useState } from "react";
import { storage, type MoodEntry } from "@/lib/storage";
import { type Emotion, EMOTION_LABELS } from "@/lib/emotionDetector";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

const MOOD_OPTIONS: { emotion: Emotion; emoji: string }[] = [
  { emotion: "neutral", emoji: "😌" },
  { emotion: "sad", emoji: "😢" },
  { emotion: "anxious", emoji: "😰" },
  { emotion: "angry", emoji: "😠" },
  { emotion: "stressed", emoji: "😫" },
];

export default function MoodPage() {
  const [moods, setMoods] = useState<MoodEntry[]>(() => storage.getMoods());
  const [selected, setSelected] = useState<Emotion | null>(null);
  const [intensity, setIntensity] = useState(3);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const saveMood = () => {
    if (!selected) return;
    const entry: MoodEntry = {
      id: crypto.randomUUID(), date: new Date().toISOString(),
      mood: selected, intensity, note: note.trim() || undefined,
    };
    storage.saveMood(entry);
    setMoods([...moods, entry]);
    setSelected(null);
    setIntensity(3);
    setNote("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const todaysMoods = moods.filter(m => new Date(m.date).toDateString() === new Date().toDateString());
  const last7 = moods.filter(m => Date.now() - new Date(m.date).getTime() < 7 * 86400000);

  return (
    <div className="h-full overflow-y-auto p-6 max-w-lg mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold">Mood Tracker</h1>
        <p className="text-muted-foreground text-sm mt-1">How are you feeling right now?</p>
      </motion.div>

      {/* Mood selector */}
      <div className="flex gap-3 justify-center">
        {MOOD_OPTIONS.map(({ emotion, emoji }, i) => (
          <motion.button
            key={emotion}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.35 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelected(emotion)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-colors duration-300 ${
              selected === emotion
                ? "border-primary bg-primary/5"
                : "border-transparent glass-card !shadow-none hover:!shadow-card"
            }`}
          >
            <span className="text-2xl">{emoji}</span>
            <span className="text-xs font-medium">{EMOTION_LABELS[emotion]}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-4 overflow-hidden"
          >
            <div>
              <label className="text-sm font-medium mb-2 block">Intensity: {intensity}/5</label>
              <input
                type="range" min={1} max={5} value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <textarea
              value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note (optional)..."
              className="w-full input-glow px-4 py-3 resize-none h-20"
            />
            <motion.button
              onClick={saveMood}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              Log Mood
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved confirmation */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center gap-2 text-primary text-sm font-medium"
          >
            <Check size={16} /> Mood logged successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's log */}
      {todaysMoods.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
          <h3 className="font-semibold text-sm">Today's Moods</h3>
          {todaysMoods.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 glass-card p-3 !rounded-xl"
            >
              <span className="text-xl">{MOOD_OPTIONS.find(o => o.emotion === m.mood)?.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{EMOTION_LABELS[m.mood]} · {m.intensity}/5</p>
                {m.note && <p className="text-xs text-muted-foreground">{m.note}</p>}
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(m.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* 7-day summary */}
      {last7.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-2">
          <h3 className="font-semibold text-sm">Last 7 Days ({last7.length} entries)</h3>
          <div className="flex gap-1.5 flex-wrap">
            {last7.map((m, i) => (
              <motion.span
                key={m.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.04, type: "spring" }}
                title={`${EMOTION_LABELS[m.mood]} - ${new Date(m.date).toLocaleDateString()}`}
                className="text-lg cursor-default"
              >
                {MOOD_OPTIONS.find(o => o.emotion === m.mood)?.emoji}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
