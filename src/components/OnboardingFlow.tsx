import { useMemo, useState } from "react";
import { trackEvent } from "../lib/analytics";
import {
  completeOnboarding,
  getRecommendedScreen,
  type OnboardingGoal,
  type OnboardingVibe,
} from "../lib/onboarding";
import type { Screen } from "../types/app";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

type OnboardingFlowProps = {
  onNavigate: (screen: Screen) => void;
};

const goals: Array<{
  id: OnboardingGoal;
  title: string;
  description: string;
  icon: string;
}> = [
  {
    id: "calm-body",
    title: "Calm my body",
    description: "Start with breathing and a slower rhythm.",
    icon: "◐",
  },
  {
    id: "feel-held",
    title: "I need softer words",
    description: "Let Mira respond with gentle emotional comfort.",
    icon: "✦",
  },
  {
    id: "quiet-space",
    title: "Give me a quiet room",
    description: "Open a soft visual space with less noise.",
    icon: "☾",
  },
  {
    id: "make-care-package",
    title: "Make something for her",
    description: "Create a small shareable comfort package.",
    icon: "♡",
  },
];

const vibes: Array<{
  id: OnboardingVibe;
  title: string;
  description: string;
}> = [
  {
    id: "rain",
    title: "Rain",
    description: "Slow, private, window-lit.",
  },
  {
    id: "moon",
    title: "Moon",
    description: "Dark, quiet, safe.",
  },
  {
    id: "rose",
    title: "Rose",
    description: "Warm, caring, soft.",
  },
  {
    id: "forest",
    title: "Forest",
    description: "Grounded, still, natural.",
  },
];

export function OnboardingFlow({ onNavigate }: OnboardingFlowProps) {
  const [goal, setGoal] = useState<OnboardingGoal>("calm-body");
  const [vibe, setVibe] = useState<OnboardingVibe>("rain");

  const selectedGoal = useMemo(() => goals.find((item) => item.id === goal) ?? goals[0], [goal]);
  const recommendedScreen = getRecommendedScreen(goal);

  function finishOnboarding(): void {
    completeOnboarding({
      goal,
      vibe,
    });

    trackEvent("onboarding_completed", {
      goal,
      vibe,
      recommendedScreen,
    });

    onNavigate(recommendedScreen);
  }

  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-7xl px-5 pb-36 pt-10 sm:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">First soft step</p>
        <h2 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100 sm:text-7xl">
          Let’s make this feel right in 30 seconds.
        </h2>
        <p className="mt-5 leading-7 text-cream-100/70">
          Choose what you need right now. Dear Her will open the softest starting point.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
        <GlassCard>
          <p className="font-display text-3xl font-semibold text-cream-100">What do you need first?</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {goals.map((item) => {
              const active = item.id === goal;

              return (
                <button
                  key={item.id}
                  className={`rounded-[1.75rem] border p-5 text-left transition ${
                    active
                      ? "border-rose-200/50 bg-rose-200/[0.12]"
                      : "border-white/10 bg-white/[0.045] hover:bg-white/[0.075]"
                  }`}
                  type="button"
                  onClick={() => {
                    setGoal(item.id);
                    trackEvent("onboarding_started", {
                      goal: item.id,
                    });
                  }}
                >
                  <span className="text-3xl">{item.icon}</span>
                  <span className="mt-4 block font-semibold text-cream-100">{item.title}</span>
                  <span className="mt-2 block text-sm leading-6 text-cream-100/60">{item.description}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            <p className="font-display text-3xl font-semibold text-cream-100">Choose the atmosphere</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              {vibes.map((item) => {
                const active = item.id === vibe;

                return (
                  <button
                    key={item.id}
                    className={`rounded-[1.5rem] border p-4 text-left transition ${
                      active
                        ? "border-emerald-200/35 bg-emerald-200/[0.10]"
                        : "border-white/10 bg-white/[0.045] hover:bg-white/[0.075]"
                    }`}
                    type="button"
                    onClick={() => setVibe(item.id)}
                  >
                    <span className="block font-semibold text-cream-100">{item.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-cream-100/55">{item.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <SoftButton onClick={finishOnboarding}>Open my soft path</SoftButton>
            <SoftButton variant="secondary" onClick={() => onNavigate("welcome")}>
              Skip for now
            </SoftButton>
          </div>
        </GlassCard>

        <GlassCard className="h-fit border-rose-200/20 bg-rose-200/[0.07]">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-200/75">Recommended path</p>
          <h3 className="mt-4 font-display text-4xl font-semibold text-cream-100">{selectedGoal.title}</h3>
          <p className="mt-4 leading-7 text-cream-100/70">
            Based on this, Dear Her will open{" "}
            <span className="font-semibold text-cream-100">{recommendedScreen.replaceAll("-", " ")}</span>.
          </p>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.055] p-4 text-sm leading-6 text-cream-100/65">
            No account needed. No medical tracking. Just a softer first step.
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
