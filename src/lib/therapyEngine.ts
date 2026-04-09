import { type Emotion, type Intensity } from "./emotionDetector";

export function getSystemPrompt(emotion: Emotion, intensity: Intensity): string {
  const base = `You are MindBridge, a compassionate AI mental health support companion trained in CBT (Cognitive Behavioral Therapy) and DBT (Dialectical Behavior Therapy) techniques. 

CRITICAL RULES:
- Never provide medical diagnoses or prescribe medication
- Always encourage professional help for serious concerns
- Keep responses supportive, safe, and non-judgmental
- Use warm, empathetic language
- Keep responses concise (2-4 paragraphs max)
- Use CBT techniques: identify cognitive distortions, thought reframing, Socratic questioning
- Use DBT techniques: mindfulness, distress tolerance, emotion regulation, interpersonal effectiveness

DISCLAIMER: Always remember you are an AI assistant, not a licensed therapist. For serious mental health concerns, encourage seeking professional help.`;

  const toneMap: Record<Emotion, string> = {
    anxious: "\n\nThe user is feeling ANXIOUS. Use a calm, slow, reassuring tone. Offer grounding techniques like the 5-4-3-2-1 method. Guide them through breathing exercises. Validate their feelings first before offering coping strategies.",
    sad: "\n\nThe user is feeling SAD. Use a warm, empathetic, gentle tone. Acknowledge their pain. Use active listening phrases. Gently guide toward identifying negative thought patterns (CBT). Offer comfort before solutions.",
    angry: "\n\nThe user is feeling ANGRY. Use a calm, validating tone. Don't minimize their anger. Help them identify triggers. Suggest healthy expression channels. Use DBT emotion regulation techniques.",
    stressed: "\n\nThe user is feeling STRESSED. Use a solution-oriented yet compassionate tone. Help break problems into smaller parts. Suggest prioritization techniques. Offer quick stress relief methods.",
    neutral: "\n\nThe user seems calm. Engage naturally. Check in on their wellbeing. Offer proactive mental health tips or reflect on their journey.",
  };

  const intensityNote = intensity === "high"
    ? "\n\nThe intensity is HIGH. Be extra gentle and validating. Take things slowly. Focus on immediate comfort and grounding before any technique."
    : intensity === "medium"
    ? "\n\nThe intensity is MODERATE. Balance empathy with gentle technique suggestions."
    : "\n\nThe intensity is LOW. You can be more conversational while still being supportive.";

  return base + toneMap[emotion] + intensityNote;
}

export const CRISIS_MESSAGE = {
  title: "🚨 We're Here For You",
  message: "It sounds like you're going through an incredibly difficult time. Your feelings are valid, and you don't have to face this alone.",
  helplines: [
    { name: "iCall (TISS)", number: "9152987821", hours: "Mon-Sat, 8am-10pm" },
    { name: "Vandrevala Foundation", number: "1860-2662-345", hours: "24/7" },
    { name: "AASRA", number: "9820466726", hours: "24/7" },
    { name: "Snehi", number: "044-24640050", hours: "24/7" },
  ],
  steps: [
    "Take a slow, deep breath — in for 4 seconds, hold for 4, out for 4",
    "If you're safe, stay where you are. If not, move to a safe place",
    "Reach out to someone you trust — a friend, family member, or counselor",
    "Call one of the helplines above — trained professionals are ready to help",
  ],
};

export const GROUNDING_EXERCISE = `**5-4-3-2-1 Grounding Technique:**
- 👀 **5 things** you can SEE
- ✋ **4 things** you can TOUCH
- 👂 **3 things** you can HEAR
- 👃 **2 things** you can SMELL
- 👅 **1 thing** you can TASTE

Take your time with each one. There's no rush.`;

export const BREATHING_INSTRUCTIONS = `**Box Breathing Exercise:**
1. Breathe IN for 4 seconds
2. HOLD for 4 seconds
3. Breathe OUT for 4 seconds
4. HOLD for 4 seconds
Repeat 4 times. Focus only on your breath.`;
