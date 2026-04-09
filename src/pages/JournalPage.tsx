import { useState } from "react";
import { storage, type JournalEntry } from "@/lib/storage";
import { BookOpen, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(() => storage.getJournals());
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const saveEntry = async () => {
    if (!content.trim()) return;
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      content: content.trim(),
    };
    storage.saveJournal(entry);
    setEntries([...entries, entry]);

    // Get AI feedback
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
      // Parse non-streaming response or SSE
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
    } catch { /* silently fail */ }
    setIsAnalyzing(false);
    setContent("");
  };

  return (
    <div className="h-full overflow-y-auto p-6 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <BookOpen size={24} className="text-primary" /> Journal
      </h1>
      <p className="text-muted-foreground text-sm">Write your thoughts. AI will provide supportive feedback.</p>

      <div className="space-y-3">
        <textarea
          value={content} onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind today..."
          className="w-full bg-muted rounded-xl px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none h-40"
        />
        <button
          onClick={saveEntry}
          disabled={!content.trim() || isAnalyzing}
          className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {isAnalyzing ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><Sparkles size={16} /> Save & Get Feedback</>}
        </button>
      </div>

      {entries.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Your Entries</h3>
          {[...entries].reverse().map((e) => (
            <div key={e.id} className="bg-card border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {new Date(e.date).toLocaleDateString()} · {new Date(e.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-sm">{e.content}</p>
              {e.aiResponse && (
                <div className="bg-calm-green rounded-lg p-3 mt-2">
                  <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                    <Sparkles size={12} /> AI Feedback
                  </p>
                  <div className="prose prose-sm max-w-none text-xs">
                    <ReactMarkdown>{e.aiResponse}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
