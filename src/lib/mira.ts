import type { Mood, Screen } from "../types/app";

export type MiraRole = "user" | "assistant";

export type MiraMessage = {
  id: string;
  role: MiraRole;
  text: string;
  createdAt: string;
};

export type MiraSuggestion = {
  label: string;
  input: string;
  navigateTo?: Screen;
};

export const miraSystemPrompt = `
You are Mira, a gentle non-medical comfort companion inside Dear Her.

Your purpose is to help the user feel calmer, safer, and emotionally supported during difficult, tiring, painful, or overwhelming days.

You are not a doctor, therapist, period tracker, medical assistant, or productivity coach.

You may offer:
- comforting words
- simple breathing guidance
- rest and warmth suggestions
- soundscape and comfort room suggestions
- gentle emotional reflection
- self-kindness reminders

You must not:
- diagnose
- recommend medicines or dosages
- claim to treat pain or illness
- pressure the user
- use productivity language
- replace professional care
`.trim();

export const miraSuggestions: MiraSuggestion[] = [
  {
    label: "Help me breathe",
    input: "I need help calming down.",
    navigateTo: "breathe",
  },
  {
    label: "Choose a room",
    input: "Help me choose a comfort room.",
    navigateTo: "room",
  },
  {
    label: "Say something soft",
    input: "I need soft words right now.",
  },
  {
    label: "I feel low",
    input: "I feel low and I do not know what I need.",
  },
  {
    label: "I feel irritated",
    input: "I feel irritated and overwhelmed.",
  },
  {
    label: "I feel alone",
    input: "I feel alone and want to feel cared for.",
  },
];

function normalize(input: string): string {
  return input.toLowerCase().trim();
}

function includesAny(input: string, words: string[]): boolean {
  return words.some((word) => input.includes(word));
}

function moodLine(mood: Mood | null): string {
  if (!mood) {
    return "Let’s begin from exactly where you are.";
  }

  return `I remember you marked your mood as “${mood}”. Let’s keep this moment extra gentle.`;
}

function severeOrUnusualSafety(input: string): string | null {
  const text = normalize(input);

  if (
    includesAny(text, [
      "kill myself",
      "suicide",
      "self harm",
      "hurt myself",
      "end my life",
      "don't want to live",
      "dont want to live",
    ])
  ) {
    return [
      "I’m really sorry this feels so heavy right now.",
      "",
      "You deserve immediate support from a real person. Please contact someone you trust now or reach local emergency services if you might hurt yourself.",
      "",
      "For this moment, move near another person if you can. You do not have to carry this alone.",
    ].join("\n");
  }

  if (
    includesAny(text, [
      "severe pain",
      "unbearable pain",
      "faint",
      "fainted",
      "can't breathe",
      "cant breathe",
      "chest pain",
      "fever",
      "vomiting",
      "very heavy bleeding",
      "unusual bleeding",
      "emergency",
    ])
  ) {
    return [
      "That sounds worrying, and I do not want to minimize it.",
      "",
      "I can stay with you gently, but symptoms that feel severe, unusual, or frightening deserve help from a qualified medical professional or local emergency service.",
      "",
      "Right now, try to be near someone you trust if possible.",
    ].join("\n");
  }

  if (
    includesAny(text, [
      "medicine",
      "medication",
      "tablet",
      "painkiller",
      "dose",
      "dosage",
      "which pill",
      "what pill",
    ])
  ) {
    return [
      "I can’t recommend medicines or dosages.",
      "",
      "A doctor or pharmacist is the right person for that. What I can do is help you make this moment softer with breathing, warmth, quiet, or a calming room.",
    ].join("\n");
  }

  return null;
}

export function generateMiraReply(input: string, mood: Mood | null): string {
  const safetyReply = severeOrUnusualSafety(input);

  if (safetyReply) {
    return safetyReply;
  }

  const text = normalize(input);
  const prefix = moodLine(mood);

  if (includesAny(text, ["cramp", "pain", "ache", "stomach", "belly", "body hurts"])) {
    return [
      prefix,
      "",
      "I’m sorry your body is asking for so much care right now.",
      "",
      "Let’s make the world smaller for a minute: soften your shoulders, unclench your jaw, and let your next exhale be longer than your inhale.",
      "",
      "A warm, quiet room and a soft soundscape may help the moment feel less sharp.",
    ].join("\n");
  }

  if (includesAny(text, ["tired", "fatigue", "sleepy", "exhausted", "drained", "weak"])) {
    return [
      prefix,
      "",
      "You do not have to earn rest today.",
      "",
      "Try this tiny reset: place one hand on your chest, breathe in gently, and say to yourself: “I am allowed to slow down.”",
      "",
      "The Night Sky Sanctuary or Fireplace Lounge may feel right for this mood.",
    ].join("\n");
  }

  if (includesAny(text, ["irritated", "angry", "annoyed", "overwhelmed", "frustrated"])) {
    return [
      prefix,
      "",
      "It makes sense that everything feels too loud right now.",
      "",
      "You are not wrong for needing space. Let’s lower the intensity: fewer words, softer light, slower breathing.",
      "",
      "Try the Cozy Rain Room and let the sound hold the silence for you.",
    ].join("\n");
  }

  if (includesAny(text, ["sad", "cry", "crying", "low", "lonely", "alone", "loved"])) {
    return [
      prefix,
      "",
      "I’m here with you softly.",
      "",
      "You are not too sensitive for needing tenderness. You are not weak for wanting care.",
      "",
      "Open a memory, read a comfort message, or just stay here with me for one slow breath.",
    ].join("\n");
  }

  if (includesAny(text, ["anxious", "stress", "panic", "scared", "heavy", "too much"])) {
    return [
      prefix,
      "",
      "Let’s not solve the whole day. Just this breath.",
      "",
      "Inhale gently for four. Hold for one. Exhale slowly for six.",
      "",
      "Again, softer this time. Your only job is to arrive back into this moment.",
    ].join("\n");
  }

  if (includesAny(text, ["room", "environment", "where should i go", "choose"])) {
    return [
      "I would choose based on what your body is asking for:",
      "",
      "Rain Room if you need silence.",
      "Forest Retreat if you need space.",
      "Ocean Escape if you need emotional release.",
      "Fireplace Lounge if you need warmth.",
      "Night Sky Sanctuary if you need to feel held.",
    ].join("\n");
  }

  return [
    prefix,
    "",
    "You do not need to explain everything perfectly.",
    "",
    "Let’s keep this moment soft: one breath, one sound, one tiny comfort.",
    "",
    "I can help you breathe, choose a room, or give you a gentle message.",
  ].join("\n");
}
