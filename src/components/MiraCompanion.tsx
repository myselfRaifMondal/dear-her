import { useEffect, useRef, useState } from "react";
import { trackEvent } from "../lib/analytics";
import { generateMiraReply, miraSuggestions, type MiraMessage } from "../lib/mira";
import type { Mood, Screen } from "../types/app";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

type MiraCompanionProps = {
  selectedMood: Mood | null;
  onNavigate: (screen: Screen) => void;
};

const storageKey = "dear-her-mvp:mira-thread";

const openingMessage: MiraMessage = {
  id: "mira-opening",
  role: "assistant",
  text: "Hi, I’m Mira. I’m here for soft support only — no diagnosis, no pressure, no fixing everything. Tell me what feels heavy, or choose one gentle option.",
  createdAt: new Date().toISOString(),
};

function loadThread(): MiraMessage[] {
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as MiraMessage[]) : [openingMessage];
  } catch {
    return [openingMessage];
  }
}

function saveThread(messages: MiraMessage[]): void {
  window.localStorage.setItem(storageKey, JSON.stringify(messages.slice(-40)));
}

export function MiraCompanion({ selectedMood, onNavigate }: MiraCompanionProps) {
  const [messages, setMessages] = useState<MiraMessage[]>(loadThread);
  const [draft, setDraft] = useState("");
  const threadRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    saveThread(messages);
  }, [messages]);

  useEffect(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function sendMessage(text: string): void {
    const cleanText = text.trim();

    if (!cleanText) return;

    const userMessage: MiraMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: cleanText,
      createdAt: new Date().toISOString(),
    };

    const assistantMessage: MiraMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: generateMiraReply(cleanText, selectedMood),
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setDraft("");
    trackEvent("mira_message_sent", { mood: selectedMood ?? "unknown" });
  }

  function clearThread(): void {
    const confirmed = window.confirm("Clear your local Mira conversation on this browser?");

    if (!confirmed) return;

    setMessages([openingMessage]);
    window.localStorage.removeItem(storageKey);
  }

  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-7xl px-5 pb-36 pt-10 sm:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">Mira companion</p>
        <h2 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100 sm:text-7xl">
          A softer voice beside you.
        </h2>
        <p className="mt-5 leading-7 text-cream-100/70">
          Mira gives emotional comfort, breathing guidance, and room suggestions. She does not diagnose, track periods, or give
          medical advice.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <GlassCard className="flex min-h-[620px] flex-col p-4 sm:p-5">
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
                    className={`max-w-[86%] whitespace-pre-line rounded-[1.5rem] px-5 py-4 text-sm leading-6 shadow-lg ${
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
          </div>

          <form
            className="mt-4 flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(draft);
            }}
          >
            <label className="sr-only" htmlFor="mira-message">
              Message Mira
            </label>
            <textarea
              id="mira-message"
              className="min-h-14 flex-1 resize-none rounded-[1.35rem] border border-white/10 bg-white/[0.06] px-4 py-4 text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
              value={draft}
              onChange={(event) => setDraft(event.currentTarget.value)}
              placeholder="Tell Mira what feels heavy..."
            />

            <div className="flex gap-3 sm:flex-col">
              <SoftButton type="submit" disabled={!draft.trim()}>
                Send
              </SoftButton>
              <SoftButton type="button" variant="ghost" onClick={clearThread}>
                Clear
              </SoftButton>
            </div>
          </form>
        </GlassCard>

        <div className="space-y-5">
          <GlassCard>
            <p className="font-display text-3xl font-semibold text-cream-100">Gentle starts</p>
            <p className="mt-2 text-sm leading-6 text-cream-100/60">
              Choose one. Mira will either answer softly or take you to a comfort space.
            </p>

            <div className="mt-5 grid gap-3">
              {miraSuggestions.map((suggestion) => (
                <button
                  key={suggestion.label}
                  className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 text-left text-sm font-semibold leading-6 text-cream-100/75 transition hover:bg-white/[0.08] hover:text-cream-100"
                  onClick={() => {
                    trackEvent("mira_suggestion_used", {
                      label: suggestion.label,
                      navigateTo: suggestion.navigateTo ?? null,
                    });

                    if (suggestion.navigateTo) {
                      onNavigate(suggestion.navigateTo);
                      return;
                    }

                    sendMessage(suggestion.input);
                  }}
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="border-rose-200/20 bg-rose-200/[0.07]">
            <p className="font-semibold text-cream-100">Safety boundary</p>
            <p className="mt-2 text-sm leading-6 text-cream-100/65">
              Mira is for comfort, not medical care. For severe, unusual, or frightening symptoms, please contact a qualified
              medical professional or local emergency service.
            </p>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
