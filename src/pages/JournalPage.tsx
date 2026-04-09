import { useState } from "react";
import { storage, type JournalEntry } from "@/lib/storage";
import { BookOpen, Sparkles, Loader2, PenLine } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(() => storage.getJournals());
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const saveEntry = async () => {
    if (!content.trim()) return;
    const entry: JournalEntry = {
      id: crypto.randomUUID(), date: new Date().toISOString(),
      content: content.trim(),
    };
    storage.saveJournal(entry);
    setEntries([...entries, entry]);

    setIsAnalyzing(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mental-health-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: `I just wrote this journal entry. Please give brief, supportive feedback (2-3 sentences). Identify any patterns or positive aspects:\n\n"${content.trim()}"` }],
          systemPrompt: "You are a supportive journaling companion. Give brief, warm feedback on journal entries. Highlight strengths, patterns, and offer gentle encouragement. Keep it to 2-3 sentences.",
        }),
      });
      if (!resp.ok) throw new Error();
      const text = await resp.text();
      let aiResponse = "";
      for (const line of text.split("\n")) {
        if (line.startsWith("data: ") && line.slice(6).trim() !== "[DONE]") {
          try {
            const c = JSON.parse(line.slice(6)).choices?.[0]?.delta?.content;
            if (c) aiResponse += c;
          } catch {}
        }
      }
      if (aiResponse) {
        storage.updateJournal(entry.id, { aiResponse });
        setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, aiResponse } : e));
      }
    } catch {}
    setIsAnalyzing(false);
    setContent("");
  };

  return (
    <div className="h-full overflow-y-auto p-6 max-w-lg mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen size={24} className="text-primary" /> Journal
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Write your thoughts. AI will provide supportive feedback.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="space-y-3"
      >
        <div className={`relative transition-all duration-500 rounded-2xl ${isFocused ? "ring-2 ring-primary/20" : ""}`}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="What's on your mind today..."
            className="w-full input-glow px-4 py-4 resize-none h-40 !rounded-2xl"
          />
          {!content && !isFocused && (
            <PenLine size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/10 pointer-events-none" />
          )}
        </div>
        <motion.button
          onClick={saveEntry}
          disabled={!content.trim() || isAnalyzing}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full btn-primary py-3 flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
          ) : (
            <><Sparkles size={16} /> Save & Get Feedback</>
          )}
        </motion.button>
      </motion.div>

      {entries.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Your Entries</h3>
          {[...entries].reverse().map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className="glass-card p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {new Date(e.date).toLocaleDateString()} · {new Date(e.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-sm leading-relaxed">{e.content}</p>
              <AnimatePresence>
                {e.aiResponse && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-calm-green rounded-xl p-3 mt-2 overflow-hidden"
                  >
                    <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                      <Sparkles size={12} /> AI Feedback
                    </p>
                    <div className="prose prose-sm max-w-none text-xs dark:prose-invert">
                      <ReactMarkdown>{e.aiResponse}</ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
