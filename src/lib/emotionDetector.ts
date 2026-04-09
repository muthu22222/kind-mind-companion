export type Emotion = "sad" | "anxious" | "angry" | "stressed" | "neutral";
export type Intensity = "low" | "medium" | "high";

export interface EmotionResult {
  emotion: Emotion;
  intensity: Intensity;
  isCrisis: boolean;
}

const CRISIS_PHRASES = [
  "i want to die", "i can't live anymore", "end my life", "kill myself",
  "suicide", "no reason to live", "better off dead", "want to end it",
  "can't go on", "i don't want to be alive", "i want to disappear forever",
];

const EMOTION_KEYWORDS: Record<Emotion, string[]> = {
  sad: ["sad", "depressed", "hopeless", "lonely", "crying", "tears", "grief", "heartbroken", "miserable", "worthless", "empty", "numb", "lost", "alone", "unhappy"],
  anxious: ["anxious", "worried", "nervous", "panic", "fear", "scared", "overthinking", "restless", "uneasy", "dread", "terrified", "phobia", "tense"],
  angry: ["angry", "furious", "rage", "mad", "frustrated", "irritated", "annoyed", "hate", "resentful", "bitter", "hostile"],
  stressed: ["stressed", "overwhelmed", "exhausted", "burned out", "pressure", "deadline", "can't handle", "too much", "overloaded", "tired", "drained"],
  neutral: [],
};

const HIGH_INTENSITY = ["extremely", "very", "so much", "can't stop", "unbearable", "terrible", "worst", "never", "always", "completely"];

export function detectEmotion(text: string): EmotionResult {
  const lower = text.toLowerCase();

  const isCrisis = CRISIS_PHRASES.some(p => lower.includes(p));
  if (isCrisis) return { emotion: "sad", intensity: "high", isCrisis: true };

  const scores: Record<Emotion, number> = { sad: 0, anxious: 0, angry: 0, stressed: 0, neutral: 0 };
  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS) as [Emotion, string[]][]) {
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[emotion]++;
    }
  }

  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return { emotion: "neutral", intensity: "low", isCrisis: false };

  const emotion = (Object.entries(scores) as [Emotion, number][]).find(([, s]) => s === maxScore)![0];
  const hasHighIntensity = HIGH_INTENSITY.some(w => lower.includes(w));
  const intensity: Intensity = maxScore >= 3 || hasHighIntensity ? "high" : maxScore >= 2 ? "medium" : "low";

  return { emotion, intensity, isCrisis: false };
}

export const EMOTION_LABELS: Record<Emotion, string> = {
  sad: "Sadness", anxious: "Anxiety", angry: "Anger", stressed: "Stress", neutral: "Calm",
};

export const EMOTION_COLORS: Record<Emotion, string> = {
  sad: "bg-emotion-sad", anxious: "bg-emotion-anxious", angry: "bg-emotion-angry",
  stressed: "bg-emotion-stressed", neutral: "bg-emotion-neutral",
};
