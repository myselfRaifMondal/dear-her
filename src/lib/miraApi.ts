import type { Mood } from "../types/app";
import type { MiraMessage } from "./mira";

type MiraApiSource = "gemini" | "safety_gate";

type MiraApiResponse = {
  reply?: string;
  source?: MiraApiSource;
  model?: string;
  fallback?: boolean;
  error?: string;
};

export async function askMiraApi(
  message: string,
  mood: Mood | null,
  recentMessages: MiraMessage[],
): Promise<{ reply: string; source: MiraApiSource; model?: string }> {
  const response = await fetch("/api/mira", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      mood,
      recentMessages: recentMessages.slice(-8),
    }),
  });

  const data = (await response.json()) as MiraApiResponse;

  if (!response.ok || !data.reply) {
    throw new Error(data.error || "Mira AI is unavailable.");
  }

  return {
    reply: data.reply,
    source: data.source ?? "gemini",
    model: data.model,
  };
}
