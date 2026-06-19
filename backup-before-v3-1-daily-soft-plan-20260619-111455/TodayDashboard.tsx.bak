import { useEffect } from "react";
import { trackEvent } from "../lib/analytics";
import type { Screen } from "../types/app";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

type TodayDashboardProps = {
  onNavigate: (screen: Screen) => void;
};

const primaryJourneys: Array<{
  title: string;
  description: string;
  screen: Screen;
  icon: string;
  event: string;
}> = [
  {
    title: "I need comfort now",
    description: "Start with breathing, quiet, and one soft next step.",
    screen: "breathe",
    icon: "◐",
    event: "comfort_now",
  },
  {
    title: "Make something soft for her",
    description: "Create a care package with a note, actions, and messages.",
    screen: "care",
    icon: "♡",
    event: "make_care_package",
  },
  {
    title: "Open my sanctuary",
    description: "Go to your personal comfort space, memories, and favorites.",
    screen: "you",
    icon: "✦",
    event: "open_sanctuary",
  },
];

const softPath: Array<{
  step: string;
  title: string;
  description: string;
  screen: Screen;
}> = [
  {
    step: "01",
    title: "Breathe",
    description: "One minute of visual calm.",
    screen: "breathe",
  },
  {
    step: "02",
    title: "Set the room",
    description: "Choose the atmosphere around you.",
    screen: "room",
  },
  {
    step: "03",
    title: "Ask Mira",
    description: "Get softer words without pressure.",
    screen: "mira",
  },
  {
    step: "04",
    title: "Save what helps",
    description: "Keep a memory, favorite, or message.",
    screen: "you",
  },
];

export function TodayDashboard({ onNavigate }: TodayDashboardProps) {
  useEffect(() => {
    trackEvent("v3_revamp_loaded", {
      surface: "today",
    });
  }, []);

  function go(screen: Screen, event: string): void {
    trackEvent("today_action_clicked", {
      action: event,
      screen,
    });

    onNavigate(screen);
  }

  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-7xl px-5 pb-36 pt-10 sm:px-8">
      <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="inline-flex rounded-full border border-rose-200/20 bg-rose-200/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-rose-100/80">
            Dear Her v3 · soft comfort product
          </div>

          <h1 className="mt-6 font-display text-6xl font-semibold tracking-[-0.055em] text-cream-100 sm:text-8xl lg:text-9xl">
            How are you arriving today?
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-cream-100/72 sm:text-xl sm:leading-9">
            Dear Her is a soft comfort sanctuary for difficult days.
          </p>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-cream-100/52">
            Not medical advice. Not a tracker. Just breathing, quiet rooms, care packages, memories, and softer words.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {primaryJourneys.map((journey) => (
              <button
                key={journey.title}
                className="group rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 text-left transition hover:-translate-y-1 hover:bg-white/[0.08]"
                type="button"
                onClick={() => go(journey.screen, journey.event)}
              >
                <span className="text-4xl">{journey.icon}</span>
                <span className="mt-5 block font-display text-2xl font-semibold leading-7 text-cream-100">
                  {journey.title}
                </span>
                <span className="mt-3 block text-sm leading-6 text-cream-100/60">
                  {journey.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <GlassCard className="relative overflow-hidden border-rose-200/20 bg-rose-200/[0.07] p-6 sm:p-8">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-rose-200/20 blur-3xl" />
          <div className="absolute -bottom-24 left-6 h-60 w-60 rounded-full bg-violet-200/10 blur-3xl" />

          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-100/70">Today’s soft path</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.035em] text-cream-100">
              One calm sequence. No overthinking.
            </h2>

            <div className="mt-6 space-y-4">
              {softPath.map((item) => (
                <button
                  key={item.step}
                  className="w-full rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-4 text-left transition hover:bg-white/[0.08]"
                  type="button"
                  onClick={() => {
                    trackEvent("today_soft_path_clicked", {
                      step: item.step,
                      screen: item.screen,
                    });
                    onNavigate(item.screen);
                  }}
                >
                  <div className="flex gap-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream-100 text-sm font-bold text-slate-950">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-cream-100">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-cream-100/60">{item.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <GlassCard className="border-emerald-200/15 bg-emerald-200/[0.06]">
          <p className="font-display text-3xl font-semibold text-cream-100">Private first</p>
          <p className="mt-3 text-sm leading-6 text-cream-100/62">
            Your memories and favorites stay on this browser unless you choose cloud sync.
          </p>
        </GlassCard>

        <GlassCard className="border-rose-200/20 bg-rose-200/[0.07]">
          <p className="font-display text-3xl font-semibold text-cream-100">Care packages</p>
          <p className="mt-3 text-sm leading-6 text-cream-100/62">
            Send someone a small comfort link when words are hard.
          </p>
        </GlassCard>

        <GlassCard>
          <p className="font-display text-3xl font-semibold text-cream-100">Mira beside you</p>
          <p className="mt-3 text-sm leading-6 text-cream-100/62">
            A gentle companion for emotional comfort, with a local fallback.
          </p>
        </GlassCard>
      </div>

      <GlassCard className="mt-8 border-rose-200/20 bg-rose-200/[0.07]">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-rose-100/70">Beta</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.035em] text-cream-100 sm:text-5xl">
              Help shape the softest version of this product.
            </h2>
            <p className="mt-4 max-w-3xl leading-7 text-cream-100/65">
              Join the beta waitlist, test care packages, and tell us what actually feels calming.
            </p>
          </div>

          <SoftButton onClick={() => go("waitlist", "join_waitlist")}>Join beta waitlist</SoftButton>
        </div>
      </GlassCard>
    </section>
  );
}
