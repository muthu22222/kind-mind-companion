import { useState } from "react";
import { storage, type MoodEntry } from "@/lib/storage";
import { type Emotion, EMOTION_LABELS } from "@/lib/emotionDetector";
import { motion } from "framer-motion";

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

  const saveMood = () => {
    if (!selected) return;
    const entry: MoodEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      mood: selected,
      intensity,
      note: note.trim() || undefined,
    };
    storage.saveMood(entry);
    setMoods([...moods, entry]);
    setSelected(null);
    setIntensity(3);
    setNote("");
  };

  const todaysMoods = moods.filter(m => new Date(m.date).toDateString() === new Date().toDateString());
  const last7 = moods.filter(m => Date.now() - new Date(m.date).getTime() < 7 * 86400000);

  return (
    <div className="h-full overflow-y-auto p-6 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Mood Tracker</h1>
      <p className="text-muted-foreground text-sm">How are you feeling right now?</p>

      {/* Mood selector */}
      <div className="flex gap-3 justify-center">
        {MOOD_OPTIONS.map(({ emotion, emoji }) => (
          <button
            key={emotion}
            onClick={() => setSelected(emotion)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
              selected === emotion ? "border-primary bg-primary/5 scale-105" : "border-transparent bg-muted hover:bg-muted/80"
            }`}
          >
            <span className="text-2xl">{emoji}</span>
            <span className="text-xs font-medium">{EMOTION_LABELS[emotion]}</span>
          </button>
        ))}
      </div>

      {selected && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
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
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none h-20"
          />
          <button onClick={saveMood} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-all">
            Log Mood
          </button>
        </motion.div>
      )}

      {/* Today's log */}
      {todaysMoods.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Today's Moods</h3>
          {todaysMoods.map((m) => (
            <div key={m.id} className="flex items-center gap-3 bg-card border rounded-xl p-3">
              <span className="text-xl">{MOOD_OPTIONS.find(o => o.emotion === m.mood)?.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{EMOTION_LABELS[m.mood]} · {m.intensity}/5</p>
                {m.note && <p className="text-xs text-muted-foreground">{m.note}</p>}
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(m.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 7-day summary */}
      {last7.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Last 7 Days ({last7.length} entries)</h3>
          <div className="flex gap-1 flex-wrap">
            {last7.map((m) => (
              <span key={m.id} title={`${EMOTION_LABELS[m.mood]} - ${new Date(m.date).toLocaleDateString()}`} className="text-lg">
                {MOOD_OPTIONS.find(o => o.emotion === m.mood)?.emoji}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
