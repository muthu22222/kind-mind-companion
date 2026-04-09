import { useState, useRef, useEffect } from "react";
import { Send, Trash2, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { detectEmotion, EMOTION_LABELS, EMOTION_COLORS, type EmotionResult } from "@/lib/emotionDetector";
import { storage, type ChatMessage } from "@/lib/storage";
import { getSystemPrompt } from "@/lib/therapyEngine";
import CrisisBanner from "@/components/CrisisBanner";


export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => storage.getChats());
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionResult | null>(null);
  const [showCrisis, setShowCrisis] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const emotion = detectEmotion(text);
    setCurrentEmotion(emotion);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
      emotion: emotion.emotion,
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    storage.saveChat(userMsg);
    setInput("");

    if (emotion.isCrisis) {
      setShowCrisis(true);
    }

    setIsLoading(true);
    let assistantContent = "";

    try {
      const systemPrompt = getSystemPrompt(emotion.emotion, emotion.intensity);
      const chatHistory = nextMessages.slice(-20).map(m => ({ role: m.role, content: m.content }));

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mental-health-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: chatHistory, systemPrompt }),
      });

      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const assistantId = crypto.randomUUID();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.id === assistantId) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { id: assistantId, role: "assistant", content: assistantContent, timestamp: new Date().toISOString() }];
              });
            }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }

      const aiMsg: ChatMessage = { id: assistantId, role: "assistant", content: assistantContent, timestamp: new Date().toISOString() };
      storage.saveChat(aiMsg);
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(), role: "assistant",
        content: "I'm sorry, I'm having trouble connecting right now. Please try again. If you're in crisis, please call the helplines listed above. 💙",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errMsg]);
      storage.saveChat(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => { storage.clearChats(); setMessages([]); setCurrentEmotion(null); };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-card px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="gradient-calm w-9 h-9 rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">MB</span>
          </div>
          <div>
            <h1 className="font-semibold text-sm">MindBridge</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Your mental health companion</span>
              {currentEmotion && (
                <span className={`emotion-indicator ${EMOTION_COLORS[currentEmotion.emotion]}`} title={EMOTION_LABELS[currentEmotion.emotion]} />
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCrisis(true)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors" title="I need help">
            <AlertTriangle size={18} />
          </button>
          <button onClick={clearChat} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors" title="Clear chat">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-muted/50 px-4 py-2 text-center shrink-0">
        <p className="text-[10px] text-muted-foreground">⚠️ This is not a replacement for professional therapy. If you're in crisis, please reach out to a mental health professional.</p>
      </div>

      {/* Crisis Banner */}
      <AnimatePresence>
        {showCrisis && <CrisisBanner onDismiss={() => setShowCrisis(false)} />}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 px-8">
            <div className="gradient-calm w-16 h-16 rounded-2xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">MB</span>
            </div>
            <h2 className="text-xl font-bold">Welcome to MindBridge</h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              I'm here to listen and support you. Share what's on your mind — everything stays private and safe. 💙
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["I'm feeling anxious", "I need to talk", "I'm stressed about work", "Help me relax"].map(s => (
                <button key={s} onClick={() => setInput(s)} className="text-xs px-3 py-2 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}`}>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                <p className="text-[10px] mt-1 opacity-50">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="chat-bubble-ai flex items-center gap-1">
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-card px-4 py-3 shrink-0">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share what's on your mind..."
            className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 transition-all hover:opacity-90"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
