import { useMemo, useState } from "react";
import { comfortMessages, moods } from "../data/content";
import type { Mood } from "../types/app";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

type ComfortMessagesProps = {
  selectedMood: Mood | null;
};

export function ComfortMessages({ selectedMood }: ComfortMessagesProps) {
  const [category, setCategory] = useState<Mood | "default">(selectedMood ?? "default");
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = useMemo(() => comfortMessages[category], [category]);
  const activeMessage = messages[messageIndex % messages.length];

  function shuffleMessage(): void {
    setMessageIndex((current) => (current + 1) % messages.length);
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-7rem)] w-full max-w-6xl place-items-center px-5 pb-36 pt-10 sm:px-8">
      <div className="w-full">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">Comfort messages</p>
          <h2 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100 sm:text-7xl">
            Words for the hard minute.
          </h2>
        </div>

        <GlassCard className="mx-auto max-w-3xl p-7 text-center sm:p-12">
          <p className="font-display text-4xl font-semibold leading-tight text-cream-100 sm:text-5xl">“{activeMessage}”</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <SoftButton onClick={shuffleMessage}>Another soft message</SoftButton>
            <SoftButton variant="secondary" onClick={() => setCategory(selectedMood ?? "default")}>
              Match my mood
            </SoftButton>
          </div>
        </GlassCard>

        <div className="mx-auto mt-6 flex max-w-4xl flex-wrap justify-center gap-3">
          <button
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              category === "default" ? "border-cream-100 bg-cream-100 text-slate-950" : "border-white/10 bg-white/[0.05] text-cream-100/70"
            }`}
            onClick={() => {
              setCategory("default");
              setMessageIndex(0);
            }}
          >
            Gentle
          </button>
          {moods.map((mood) => (
            <button
              key={mood}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                category === mood ? "border-cream-100 bg-cream-100 text-slate-950" : "border-white/10 bg-white/[0.05] text-cream-100/70"
              }`}
              onClick={() => {
                setCategory(mood);
                setMessageIndex(0);
              }}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
