import type { Emotion } from "./emotionDetector";

export interface MoodEntry {
  id: string;
  date: string;
  mood: Emotion;
  intensity: number; // 1-5
  note?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  aiResponse?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  emotion?: Emotion;
}

const KEY_MOODS = "mindbridge_moods";
const KEY_JOURNALS = "mindbridge_journals";
const KEY_CHATS = "mindbridge_chats";

export const storage = {
  getMoods: (): MoodEntry[] => JSON.parse(localStorage.getItem(KEY_MOODS) || "[]"),
  saveMood: (entry: MoodEntry) => {
    const moods = storage.getMoods();
    moods.push(entry);
    localStorage.setItem(KEY_MOODS, JSON.stringify(moods));
  },

  getJournals: (): JournalEntry[] => JSON.parse(localStorage.getItem(KEY_JOURNALS) || "[]"),
  saveJournal: (entry: JournalEntry) => {
    const journals = storage.getJournals();
    journals.push(entry);
    localStorage.setItem(KEY_JOURNALS, JSON.stringify(journals));
  },
  updateJournal: (id: string, updates: Partial<JournalEntry>) => {
    const journals = storage.getJournals();
    const idx = journals.findIndex(j => j.id === id);
    if (idx !== -1) {
      journals[idx] = { ...journals[idx], ...updates };
      localStorage.setItem(KEY_JOURNALS, JSON.stringify(journals));
    }
  },

  getChats: (): ChatMessage[] => JSON.parse(localStorage.getItem(KEY_CHATS) || "[]"),
  saveChat: (msg: ChatMessage) => {
    const chats = storage.getChats();
    chats.push(msg);
    localStorage.setItem(KEY_CHATS, JSON.stringify(chats));
  },
  clearChats: () => localStorage.removeItem(KEY_CHATS),
};
