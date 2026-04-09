import { useMemo } from "react";
import { storage } from "@/lib/storage";
import { EMOTION_LABELS, type Emotion } from "@/lib/emotionDetector";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Activity, MessageCircle, BookOpen, TrendingUp, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const PIE_COLORS = ["#3b9e8f", "#5b8def", "#e8a838", "#e05555", "#9b6bc9"];

export default function DashboardPage() {
  const moods = storage.getMoods();
  const chats = storage.getChats();
  const journals = storage.getJournals();

  const moodDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    moods.forEach(m => { counts[m.mood] = (counts[m.mood] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({
      name: EMOTION_LABELS[name as Emotion], value,
    }));
  }, [moods]);

  const weeklyMoods = useMemo(() => {
    const days: Record<string, { total: number; count: number }> = {};
    moods.filter(m => Date.now() - new Date(m.date).getTime() < 7 * 86400000).forEach(m => {
      const day = new Date(m.date).toLocaleDateString("en", { weekday: "short" });
      if (!days[day]) days[day] = { total: 0, count: 0 };
      days[day].total += m.intensity;
      days[day].count++;
    });
    return Object.entries(days).map(([day, { total, count }]) => ({
      day, avg: Math.round((total / count) * 10) / 10,
    }));
  }, [moods]);

  const stats = [
    { label: "Mood Entries", value: moods.length, icon: Activity, color: "bg-calm-green" },
    { label: "Chat Messages", value: chats.length, icon: MessageCircle, color: "bg-calm-blue" },
    { label: "Journal Entries", value: journals.length, icon: BookOpen, color: "bg-calm-lavender" },
    { label: "Days Active", value: new Set(moods.map(m => new Date(m.date).toDateString())).size, icon: TrendingUp, color: "bg-calm-peach" },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your mental wellness journey</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.4, ease: "easeOut" }}
            className="glass-card p-4 flex items-center gap-3"
          >
            <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center`}>
              <Icon size={18} className="text-foreground/70" />
            </div>
            <div>
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {weeklyMoods.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="glass-card p-5"
        >
          <h3 className="font-semibold text-sm mb-4">Weekly Mood Intensity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyMoods}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="avg" fill="hsl(174, 62%, 40%)" radius={[8, 8, 0, 0]} animationDuration={1200} animationEasing="ease-out" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {moodDistribution.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="glass-card p-5"
        >
          <h3 className="font-semibold text-sm mb-4">Emotion Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={moodDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} label animationDuration={1200} animationEasing="ease-out">
                {moodDistribution.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {moods.length === 0 && chats.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center py-16"
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="inline-block mb-4"
          >
            <Sparkles size={40} className="text-primary/30" />
          </motion.div>
          <p className="text-sm text-muted-foreground">Start chatting and logging moods to see your dashboard come to life! 🌱</p>
        </motion.div>
      )}
    </div>
  );
}
