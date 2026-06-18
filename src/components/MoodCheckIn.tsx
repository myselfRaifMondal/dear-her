import { moods } from "../data/content";
import type { Mood, Screen } from "../types/app";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

type MoodCheckInProps = {
  selectedMood: Mood | null;
  onSelectMood: (mood: Mood) => void;
  onNavigate: (screen: Screen) => void;
};

export function MoodCheckIn({ selectedMood, onSelectMood, onNavigate }: MoodCheckInProps) {
  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-5xl px-5 pb-36 pt-12 sm:px-8">
      <GlassCard className="mx-auto max-w-3xl p-6 text-center sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">Mood check-in</p>
        <h2 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100 sm:text-6xl">
          What does your body need right now?
        </h2>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-cream-100/70">
          No scores. No charts. Just a soft word for the feeling you are carrying.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {moods.map((mood) => {
            const active = selectedMood === mood;
            return (
              <button
                key={mood}
                className={`min-h-12 rounded-full border px-5 text-sm font-semibold transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-200 ${
                  active
                    ? "border-cream-100 bg-cream-100 text-slate-950"
                    : "border-white/10 bg-white/[0.06] text-cream-100/75 hover:bg-white/10 hover:text-cream-100"
                }`}
                onClick={() => onSelectMood(mood)}
              >
                {mood}
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <SoftButton disabled={!selectedMood} onClick={() => onNavigate("room")}>
            Take me to my comfort room
          </SoftButton>
          <SoftButton variant="secondary" onClick={() => onNavigate("messages")}>
            Give me words first
          </SoftButton>
        </div>
      </GlassCard>
    </section>
  );
}
