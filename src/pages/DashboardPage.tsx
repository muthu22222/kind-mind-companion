import { useMemo } from "react";
import { storage } from "@/lib/storage";
import { EMOTION_LABELS, type Emotion } from "@/lib/emotionDetector";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Activity, MessageCircle, BookOpen, TrendingUp } from "lucide-react";

const PIE_COLORS = ["#3b9e8f", "#5b8def", "#e8a838", "#e05555", "#9b6bc9"];

export default function DashboardPage() {
  const moods = storage.getMoods();
  const chats = storage.getChats();
  const journals = storage.getJournals();

  const moodDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    moods.forEach(m => { counts[m.mood] = (counts[m.mood] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({
      name: EMOTION_LABELS[name as Emotion],
      value,
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
      day,
      avg: Math.round((total / count) * 10) / 10,
    }));
  }, [moods]);

  const stats = [
    { label: "Mood Entries", value: moods.length, icon: Activity, color: "bg-calm-green" },
    { label: "Chat Messages", value: chats.length, icon: MessageCircle, color: "bg-calm-blue" },
    { label: "Journal Entries", value: journals.length, icon: BookOpen, color: "bg-calm-lavender" },
    { label: "Days Active", value: new Set(moods.map(m => new Date(m.date).toDateString())).size, icon: TrendingUp, color: "bg-warm-peach" },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border rounded-xl p-4 flex items-center gap-3">
            <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center`}>
              <Icon size={18} className="text-foreground/70" />
            </div>
            <div>
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {weeklyMoods.length > 0 && (
        <div className="bg-card border rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-4">Weekly Mood Intensity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyMoods}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="avg" fill="hsl(174, 62%, 40%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {moodDistribution.length > 0 && (
        <div className="bg-card border rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-4">Emotion Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={moodDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {moodDistribution.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {moods.length === 0 && chats.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Start chatting and logging moods to see your dashboard come to life! 🌱</p>
        </div>
      )}
    </div>
  );
}
