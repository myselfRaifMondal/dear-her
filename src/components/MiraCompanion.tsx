import { useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "../lib/analytics";
import { askMiraApi } from "../lib/miraApi";
import { generateMiraReply, type MiraMessage } from "../lib/mira";
import { consumePendingMiraIntent, createPromptFromIntent, type MiraIntent } from "../lib/miraIntents";
import type { Mood, Screen } from "../types/app";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

type MiraCompanionProps = {
  selectedMood: Mood | null;
  onNavigate: (screen: Screen) => void;
};

type GuidedPrompt = {
  id: MiraIntent;
  title: string;
  description: string;
  prompt: string;
};

type ComfortPlanItem = {
  title: string;
  description: string;
  screen: Screen;
  action: string;
};

const storageKey = "dear-her-mvp:mira-thread";

const openingMessage: MiraMessage = {
  id: "mira-opening",
  role: "assistant",
  text:
    "Hi, I’m Mira. I can help you choose one soft step, write a gentle care note, or make a tiny comfort plan. I’m here for comfort — not diagnosis, medication, or medical advice.",
  createdAt: new Date().toISOString(),
};

const guidedPrompts: GuidedPrompt[] = [
  {
    id: "comfort-now",
    title: "I need comfort now",
    description: "Get one tiny next step when everything feels too much.",
    prompt: "I need comfort now. Please help me choose one tiny soft step.",
  },
  {
    id: "care-note",
    title: "Help me write a care note",
    description: "Make your care package message softer and warmer.",
    prompt: "Help me write a soft care note for someone having a hard day. Keep it warm, personal, and not dramatic.",
  },
  {
    id: "soft-plan",
    title: "Make a 3-step soft plan",
    description: "A tiny sequence for breathing, room, and rest.",
    prompt: "Make me a tiny 3-step comfort plan for right now. Keep it gentle and easy.",
  },
  {
    id: "pain-fatigue",
    title: "Pain or fatigue comfort",
    description: "Non-medical comfort for body heaviness.",
    prompt: "I feel physically tired and uncomfortable. Please give me soft non-medical comfort and one tiny next step.",
  },
  {
    id: "anxious-night",
    title: "An anxious night",
    description: "Slow words for a loud mind.",
    prompt: "It feels like an anxious night. Help me slow down with gentle words and a tiny breathing step.",
  },
  {
    id: "lonely",
    title: "I feel alone",
    description: "Soft reassurance without pressure.",
    prompt: "I feel lonely. Please say something soft and help me feel less alone.",
  },
];

const comfortPlan: ComfortPlanItem[] = [
  {
    title: "Start with breath",
    description: "One minute of visual breathing.",
    screen: "breathe",
    action: "open_breathe",
  },
  {
    title: "Set the room",
    description: "Choose a soft atmosphere.",
    screen: "room",
    action: "open_room",
  },
  {
    title: "Keep what helps",
    description: "Save a message, memory, or favorite.",
    screen: "you",
    action: "open_you",
  },
];

function loadThread(): MiraMessage[] {
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as MiraMessage[]) : [openingMessage];
  } catch {
    return [openingMessage];
  }
}

function saveThread(messages: MiraMessage[]): void {
  window.localStorage.setItem(storageKey, JSON.stringify(messages.slice(-50)));
}

function createUserMessage(text: string): MiraMessage {
  return {
    id: crypto.randomUUID(),
    role: "user",
    text,
    createdAt: new Date().toISOString(),
  };
}

function createAssistantMessage(text: string): MiraMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    text,
    createdAt: new Date().toISOString(),
  };
}

export function MiraCompanion({ selectedMood, onNavigate }: MiraCompanionProps) {
  const [messages, setMessages] = useState<MiraMessage[]>(loadThread);
  const [draft, setDraft] = useState("");
  const [noteRecipient, setNoteRecipient] = useState("");
  const [noteContext, setNoteContext] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [lastSource, setLastSource] = useState<"gemini" | "safety_gate" | "local" | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const lastAssistantMessage = useMemo(() => [...messages].reverse().find((item) => item.role === "assistant"), [messages]);

  useEffect(() => {
    saveThread(messages);
  }, [messages]);

  useEffect(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isThinking]);

  useEffect(() => {
    const pendingIntent = consumePendingMiraIntent();

    if (!pendingIntent) return;

    const prompt = createPromptFromIntent(pendingIntent);
    trackEvent("mira_guided_prompt_clicked", {
      intent: pendingIntent,
      source: "pending_intent",
    });

    void sendMessage(prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendMessage(text: string): Promise<void> {
    const cleanText = text.trim();

    if (!cleanText || isThinking) return;

    const userMessage = createUserMessage(cleanText);
    const threadWithUser = [...messages, userMessage];

    setMessages(threadWithUser);
    setDraft("");
    setIsThinking(true);
    setLastError(null);

    try {
      const result = await askMiraApi(cleanText, selectedMood, threadWithUser);
      const assistantMessage = createAssistantMessage(result.reply);

      setMessages([...threadWithUser, assistantMessage]);
      setLastSource(result.source);

      trackEvent("mira_ai_reply_success", {
        source: result.source,
        model: result.model ?? "unknown",
        mood: selectedMood ?? "unknown",
      });
    } catch (error) {
      const fallbackReply = generateMiraReply(cleanText, selectedMood);
      const assistantMessage = createAssistantMessage(`${fallbackReply}\n\n— Local comfort fallback`);

      setMessages([...threadWithUser, assistantMessage]);
      setLastSource("local");
      setLastError(error instanceof Error ? error.message : "Mira Gemini is unavailable.");

      trackEvent("mira_ai_reply_fallback", {
        mood: selectedMood ?? "unknown",
      });
    } finally {
      setIsThinking(false);
    }
  }

  function useGuidedPrompt(prompt: GuidedPrompt): void {
    trackEvent("mira_guided_prompt_clicked", {
      intent: prompt.id,
      source: "mira_page",
    });

    void sendMessage(prompt.prompt);
  }

  function generateCareNotePrompt(): void {
    const recipient = noteRecipient.trim() || "her";
    const context = noteContext.trim() || "she is having a difficult day";

    const prompt = [
      `Help me write a short, soft care note for ${recipient}.`,
      `Context: ${context}.`,
      "Make it warm, emotionally supportive, not dramatic, not medical, and not too long.",
      "Give me 3 options: very soft, romantic, and simple.",
    ].join("\n");

    trackEvent("mira_note_helper_used", {
      hasRecipient: Boolean(noteRecipient.trim()),
      hasContext: Boolean(noteContext.trim()),
    });

    void sendMessage(prompt);
  }

  function clearThread(): void {
    const confirmed = window.confirm("Clear your local Mira conversation on this browser?");

    if (!confirmed) return;

    setMessages([openingMessage]);
    window.localStorage.removeItem(storageKey);
    setLastSource(null);
    setLastError(null);

    trackEvent("mira_thread_cleared", {
      surface: "mira",
    });
  }

  async function copyLastReply(): Promise<void> {
    if (!lastAssistantMessage) return;

    try {
      await window.navigator.clipboard.writeText(lastAssistantMessage.text);
      trackEvent("mira_copy_reply_clicked", {
        success: true,
      });
      setLastError(null);
    } catch {
      trackEvent("mira_copy_reply_clicked", {
        success: false,
      });
      setLastError("Could not copy reply automatically.");
    }
  }

  function openPlanItem(item: ComfortPlanItem): void {
    trackEvent("mira_plan_suggestion_clicked", {
      action: item.action,
      screen: item.screen,
    });

    onNavigate(item.screen);
  }

  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-7xl px-5 pb-36 pt-10 sm:px-8">
      <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_0.58fr] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">Mira companion</p>
          <h2 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100 sm:text-7xl">
            Softer words, clearer next steps.
          </h2>
          <p className="mt-5 max-w-3xl leading-7 text-cream-100/70">
            Mira can help you choose a tiny comfort action, write a gentle care note, or make a soft plan.
          </p>
        </div>

        <GlassCard className="border-rose-200/20 bg-rose-200/[0.07]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-100/70">Status</p>
          <p className="mt-3 font-display text-3xl font-semibold text-cream-100">
            {lastSource === "gemini"
              ? "Gemini enhanced"
              : lastSource === "safety_gate"
                ? "Safety reply"
                : lastSource === "local"
                  ? "Local fallback"
                  : "Ready"}
          </p>
          <p className="mt-2 text-sm leading-6 text-cream-100/60">
            Comfort only. No diagnosis, medication, dosage, or medical advice.
          </p>
        </GlassCard>
      </div>

      {lastError ? (
        <div className="mb-6 rounded-3xl border border-rose-200/20 bg-rose-200/[0.10] p-4 text-sm leading-6 text-rose-100/85">
          {lastError}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="space-y-5">
          <GlassCard>
            <p className="font-display text-3xl font-semibold text-cream-100">Guided starts</p>
            <p className="mt-2 text-sm leading-6 text-cream-100/60">
              Choose one when typing feels like too much.
            </p>

            <div className="mt-5 grid gap-3">
              {guidedPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 text-left transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  disabled={isThinking}
                  onClick={() => useGuidedPrompt(prompt)}
                >
                  <span className="block font-display text-2xl font-semibold text-cream-100">{prompt.title}</span>
                  <span className="mt-2 block text-sm leading-6 text-cream-100/60">{prompt.description}</span>
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="border-emerald-200/15 bg-emerald-200/[0.06]">
            <p className="font-display text-3xl font-semibold text-cream-100">Care note helper</p>
            <p className="mt-2 text-sm leading-6 text-cream-100/60">
              Use this before creating a care package.
            </p>

            <div className="mt-5 space-y-4">
              <label className="block text-sm font-semibold text-cream-100/75">
                Who is it for?
                <input
                  className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
                  value={noteRecipient}
                  onChange={(event) => setNoteRecipient(event.currentTarget.value)}
                  placeholder="Her name"
                />
              </label>

              <label className="block text-sm font-semibold text-cream-100/75">
                What is the situation?
                <textarea
                  className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
                  value={noteContext}
                  onChange={(event) => setNoteContext(event.currentTarget.value)}
                  placeholder="She is tired, anxious, in pain, or having a hard day..."
                />
              </label>

              <SoftButton onClick={generateCareNotePrompt} disabled={isThinking}>
                Help me write it
              </SoftButton>
            </div>
          </GlassCard>

          <GlassCard>
            <p className="font-display text-3xl font-semibold text-cream-100">Soft plan shortcuts</p>

            <div className="mt-5 grid gap-3">
              {comfortPlan.map((item) => (
                <button
                  key={item.action}
                  className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 text-left transition hover:bg-white/[0.08]"
                  type="button"
                  onClick={() => openPlanItem(item)}
                >
                  <span className="block font-semibold text-cream-100">{item.title}</span>
                  <span className="mt-2 block text-sm leading-6 text-cream-100/60">{item.description}</span>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        <GlassCard className="flex min-h-[720px] flex-col p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-3xl font-semibold text-cream-100">Conversation</p>
              <p className="mt-1 text-sm text-cream-100/50">
                {selectedMood ? `Mood: ${selectedMood}` : "No mood selected yet"}
              </p>
            </div>

            <div className="flex gap-2">
              <SoftButton variant="secondary" onClick={copyLastReply} disabled={!lastAssistantMessage}>
                Copy reply
              </SoftButton>
              <SoftButton variant="ghost" onClick={clearThread} disabled={isThinking}>
                Clear
              </SoftButton>
            </div>
          </div>

          <div
            ref={threadRef}
            className="flex-1 space-y-4 overflow-y-auto rounded-[1.75rem] border border-white/10 bg-slate-950/25 p-4 [scrollbar-width:thin]"
            aria-live="polite"
          >
            {messages.map((message) => {
              const assistant = message.role === "assistant";

              return (
                <div key={message.id} className={`flex ${assistant ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[88%] whitespace-pre-line rounded-[1.5rem] px-5 py-4 text-sm leading-6 shadow-lg ${
                      assistant
                        ? "border border-white/10 bg-white/[0.07] text-cream-100/80"
                        : "bg-cream-100 text-slate-950"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              );
            })}

            {isThinking ? (
              <div className="flex justify-start">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.07] px-5 py-4 text-sm leading-6 text-cream-100/65">
                  Mira is choosing softer words…
                </div>
              </div>
            ) : null}
          </div>

          <form
            className="mt-4 flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage(draft);
            }}
          >
            <label className="sr-only" htmlFor="mira-message">
              Message Mira
            </label>
            <textarea
              id="mira-message"
              className="min-h-16 flex-1 resize-none rounded-[1.35rem] border border-white/10 bg-white/[0.06] px-4 py-4 text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
              value={draft}
              onChange={(event) => setDraft(event.currentTarget.value)}
              placeholder="Tell Mira what feels heavy..."
              disabled={isThinking}
            />

            <div className="flex gap-3 sm:flex-col">
              <SoftButton type="submit" disabled={!draft.trim() || isThinking}>
                {isThinking ? "Sending" : "Send"}
              </SoftButton>
              <SoftButton
                type="button"
                variant="secondary"
                onClick={() => {
                  setDraft("Make this moment 5% softer for me.");
                }}
                disabled={isThinking}
              >
                Fill
              </SoftButton>
            </div>
          </form>
        </GlassCard>
      </div>

      <GlassCard className="mt-6 border-rose-200/20 bg-rose-200/[0.07]">
        <p className="font-semibold text-cream-100">Safety boundary</p>
        <p className="mt-2 text-sm leading-6 text-cream-100/65">
          Mira is for emotional comfort only. For severe, unusual, frightening, or urgent symptoms, contact a qualified medical professional or local emergency service.
        </p>
      </GlassCard>
    </section>
  );
}
