import { useEffect, useMemo, useState } from "react";
import { trackEvent } from "../lib/analytics";
import {
  dailySoftPlanSteps,
  getDailyProgress,
  getNextDailyStep,
  loadDailySoftPlan,
  markDailyStepComplete,
  resetDailySoftPlan,
  setLastDailyScreen,
  updateDailyEnergy,
  updateDailyIntention,
  type DailySoftPlan,
  type DailySoftPlanStep,
} from "../lib/dailySoftPlan";
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

const energyOptions: Array<{
  id: DailySoftPlan["energy"];
  label: string;
  description: string;
}> = [
  {
    id: "low",
    label: "Low",
    description: "Keep everything tiny.",
  },
  {
    id: "medium",
    label: "Medium",
    description: "A gentle sequence is okay.",
  },
  {
    id: "heavy",
    label: "Heavy",
    description: "No pressure. Just one breath.",
  },
];

export function TodayDashboard({ onNavigate }: TodayDashboardProps) {
  const [plan, setPlan] = useState<DailySoftPlan>(() => loadDailySoftPlan());
  const [intentionDraft, setIntentionDraft] = useState(plan.intention);

  const progress = useMemo(() => getDailyProgress(plan), [plan]);
  const nextStep = useMemo(() => getNextDailyStep(plan), [plan]);

  useEffect(() => {
    trackEvent("v3_revamp_loaded", {
      surface: "today",
      dailyProgress: progress,
    });
  }, [progress]);

  function go(screen: Screen, event: string): void {
    setLastDailyScreen(screen);

    trackEvent("today_action_clicked", {
      action: event,
      screen,
    });

    onNavigate(screen);
  }

  function openStep(step: DailySoftPlanStep): void {
    setLastDailyScreen(step.screen);

    trackEvent("daily_plan_step_opened", {
      step: step.id,
      screen: step.screen,
    });

    onNavigate(step.screen);
  }

  function completeStep(step: DailySoftPlanStep): void {
    const updated = markDailyStepComplete(step.id);
    setPlan(updated);

    trackEvent("daily_plan_step_completed", {
      step: step.id,
      progress: getDailyProgress(updated),
    });
  }

  function saveIntention(): void {
    const updated = updateDailyIntention(intentionDraft);
    setPlan(updated);
    setIntentionDraft(updated.intention);

    trackEvent("daily_plan_intention_updated", {
      intentionLength: updated.intention.length,
    });
  }

  function changeEnergy(energy: DailySoftPlan["energy"]): void {
    const updated = updateDailyEnergy(energy);
    setPlan(updated);

    trackEvent("daily_plan_energy_updated", {
      energy,
    });
  }

  function resetPlan(): void {
    const confirmed = window.confirm("Reset today's soft plan?");

    if (!confirmed) return;

    const updated = resetDailySoftPlan();
    setPlan(updated);
    setIntentionDraft(updated.intention);

    trackEvent("daily_plan_reset", {
      date: updated.date,
    });
  }

  function startDailyPlan(): void {
    trackEvent("daily_plan_started", {
      nextStep: nextStep.id,
    });

    openStep(nextStep);
  }

  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-7xl px-5 pb-36 pt-10 sm:px-8">
      <div className="grid items-center gap-8 lg:grid-cols-[1.02fr_0.98fr]">
        <div>
          <div className="inline-flex rounded-full border border-rose-200/20 bg-rose-200/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-rose-100/80">
            Dear Her v3.1 · daily soft plan
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
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-100/70">
                  Today’s soft plan
                </p>
                <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.035em] text-cream-100">
                  {progress}% softer path complete
                </h2>
              </div>

              <div className="grid h-20 w-20 place-items-center rounded-full border border-white/10 bg-white/[0.07] text-lg font-bold text-cream-100">
                {progress}%
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="h-full rounded-full bg-cream-100 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-4">
              <p className="text-sm font-semibold text-cream-100/70">Today’s intention</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  className="min-h-12 flex-1 rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-sm text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
                  value={intentionDraft}
                  onChange={(event) => setIntentionDraft(event.currentTarget.value)}
                  onBlur={saveIntention}
                  placeholder="Make today 5% softer."
                />
                <SoftButton variant="secondary" onClick={saveIntention}>
                  Save
                </SoftButton>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {energyOptions.map((energy) => {
                const active = plan.energy === energy.id;

                return (
                  <button
                    key={energy.id}
                    className={`rounded-3xl border p-4 text-left transition ${
                      active
                        ? "border-emerald-200/35 bg-emerald-200/[0.10]"
                        : "border-white/10 bg-white/[0.045] hover:bg-white/[0.075]"
                    }`}
                    type="button"
                    onClick={() => changeEnergy(energy.id)}
                  >
                    <span className="block font-semibold text-cream-100">{energy.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-cream-100/55">{energy.description}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <SoftButton onClick={startDailyPlan}>Continue soft plan</SoftButton>
              {plan.lastScreen ? (
                <SoftButton variant="secondary" onClick={() => go(plan.lastScreen as Screen, "resume_last_screen")}>
                  Resume last space
                </SoftButton>
              ) : null}
              <SoftButton variant="ghost" onClick={resetPlan}>
                Reset today
              </SoftButton>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-4">
        {dailySoftPlanSteps.map((step) => {
          const completed = plan.completedSteps.includes(step.id);

          return (
            <GlassCard
              key={step.id}
              className={completed ? "border-emerald-200/20 bg-emerald-200/[0.07]" : "bg-white/[0.04]"}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cream-100/42">
                    {completed ? "Done" : "Next step"}
                  </p>
                  <p className="mt-3 font-display text-3xl font-semibold text-cream-100">{step.title}</p>
                  <p className="mt-3 text-sm leading-6 text-cream-100/60">{step.description}</p>
                </div>

                <button
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border text-sm font-bold transition ${
                    completed
                      ? "border-emerald-200/30 bg-emerald-200/[0.14] text-emerald-100"
                      : "border-white/10 bg-white/[0.055] text-cream-100/60 hover:bg-white/[0.09]"
                  }`}
                  type="button"
                  onClick={() => completeStep(step)}
                  aria-label={`Mark ${step.title} complete`}
                >
                  {completed ? "✓" : "+"}
                </button>
              </div>

              <div className="mt-5 flex gap-2">
                <SoftButton variant="secondary" onClick={() => openStep(step)}>
                  Open
                </SoftButton>
                {!completed ? (
                  <SoftButton variant="ghost" onClick={() => completeStep(step)}>
                    Mark done
                  </SoftButton>
                ) : null}
              </div>
            </GlassCard>
          );
        })}
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
