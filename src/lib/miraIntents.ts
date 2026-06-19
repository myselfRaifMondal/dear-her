export type MiraIntent =
  | "comfort-now"
  | "care-note"
  | "soft-plan"
  | "pain-fatigue"
  | "anxious-night"
  | "lonely"
  | "irritated";

const miraIntentKey = "dear-her-v3:mira-intent";

export function setPendingMiraIntent(intent: MiraIntent): void {
  window.sessionStorage.setItem(miraIntentKey, intent);
}

export function consumePendingMiraIntent(): MiraIntent | null {
  const intent = window.sessionStorage.getItem(miraIntentKey) as MiraIntent | null;
  window.sessionStorage.removeItem(miraIntentKey);
  return intent;
}

export function createPromptFromIntent(intent: MiraIntent): string {
  if (intent === "care-note") {
    return "Help me write a soft care note for someone having a hard day. Keep it warm, personal, and not dramatic.";
  }

  if (intent === "soft-plan") {
    return "Make me a tiny 3-step comfort plan for right now. Keep it gentle and easy.";
  }

  if (intent === "pain-fatigue") {
    return "I feel physically tired and uncomfortable. Please give me soft non-medical comfort and one tiny next step.";
  }

  if (intent === "anxious-night") {
    return "It feels like an anxious night. Help me slow down with gentle words and a tiny breathing step.";
  }

  if (intent === "lonely") {
    return "I feel lonely. Please say something soft and help me feel less alone.";
  }

  if (intent === "irritated") {
    return "I feel irritated and sensitive. Help me soften the moment without telling me to be productive.";
  }

  return "I need comfort now. Help me choose the softest next step.";
}
