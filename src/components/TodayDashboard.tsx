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

const energyOptions: Array<{
  id: DailySoftPlan["energy"];
  label: string;
  description: string;
}> = [
  {
    id: "low",
    label: "Low",
    description: "Keep it tiny.",
  },
  {
    id: "medium",
    label: "Okay",
    description: "A soft path is fine.",
  },
  {
    id: "heavy",
    label: "Heavy",
    description: "Just one breath.",
  },
];

export function TodayDashboard({ onNavigate }: TodayDashboardProps) {
  const [plan, setPlan] = useState<DailySoftPlan>(() => loadDailySoftPlan());
  const [intentionDraft, setIntentionDraft] = useState(plan.intention);
  const [showPlanDetails, setShowPlanDetails] = useState(false);

  const progress = useMemo(() => getDailyProgress(plan), [plan]);
  const nextStep = useMemo(() => getNextDailyStep(plan), [plan]);

  useEffect(() => {
    trackEvent("landing_decompression_loaded", {
      dailyProgress: progress,
    });
  }, [progress]);

  function go(screen: Screen, event: string): void {
    setLastDailyScreen(screen);

    trackEvent("landing_secondary_action_clicked", {
      action: event,
      screen,
    });

    onNavigate(screen);
  }

  function primaryComfortNow(): void {
    setLastDailyScreen("breathe");

    trackEvent("landing_primary_cta_clicked", {
      action: "comfort_now",
      screen: "breathe",
    });

    onNavigate("breathe");
  }

  function openStep(step: DailySoftPlanStep): void {
    setLastDailyScreen(step.screen);

    trackEvent("landing_soft_path_clicked", {
      step: step.id,
      screen: step.screen,
    });

    onNavigate(step.screen);
  }

  function completeStep(step: DailySoftPlanStep): void {
    const updated = markDailyStepComplete(step.id);
    setPlan(updated);

    trackEvent("landing_daily_step_completed", {
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

  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-6xl px-5 pb-36 pt-10 sm:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <div className="inline-flex rounded-full border border-rose-200/20 bg-rose-200/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-rose-100/80">
          Dear Her
        </div>

        <h1 className="mt-7 font-display text-6xl font-semibold tracking-[-0.055em] text-cream-100 sm:text-8xl lg:text-9xl">
          How are you arriving today?
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-cream-100/70 sm:text-xl sm:leading-9">
          A soft comfort space for difficult days.
        </p>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-cream-100/48">
          Not medical advice. Not a tracker. Just breathing, quiet rooms, care packages, memories, and softer words.
        </p>

        <div className="mx-auto mt-8 flex max-w-2xl flex-col justify-center gap-3 sm:flex-row">
          <SoftButton onClick={primaryComfortNow}>I need comfort now</SoftButton>

          <SoftButton variant="secondary" onClick={() => go("care", "make_care_package")}>
            Make a care package
          </SoftButton>

          <SoftButton variant="secondary" onClick={() => go("you", "open_sanctuary")}>
            Open my sanctuary
          </SoftButton>
        </div>
      </div>

      <GlassCard className="mx-auto mt-10 max-w-5xl border-rose-200/20 bg-rose-200/[0.06] p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-100/70">Today’s soft path</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.035em] text-cream-100">
              One calm sequence.
            </h2>
            <p className="mt-3 text-sm leading-6 text-cream-100/60">
              Next: <span className="font-semibold text-cream-100">{nextStep.title}</span> · {progress}% complete
            </p>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="h-full rounded-full bg-cream-100 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <SoftButton onClick={() => openStep(nextStep)}>Continue</SoftButton>
              <SoftButton variant="ghost" onClick={() => setShowPlanDetails((value) => !value)}>
                {showPlanDetails ? "Hide plan" : "Show plan"}
              </SoftButton>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            {dailySoftPlanSteps.map((step) => {
              const completed = plan.completedSteps.includes(step.id);

              return (
                <button
                  key={step.id}
                  className={`rounded-[1.5rem] border p-4 text-left transition ${
                    completed
                      ? "border-emerald-200/25 bg-emerald-200/[0.09]"
                      : "border-white/10 bg-white/[0.045] hover:bg-white/[0.075]"
                  }`}
                  type="button"
                  onClick={() => openStep(step)}
                >
                  <span className="block text-sm font-semibold text-cream-100">
                    {completed ? "✓ " : ""}
                    {step.title}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-cream-100/50">{step.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        {showPlanDetails ? (
          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
              <div>
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

              <div>
                <p className="text-sm font-semibold text-cream-100/70">Energy</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {energyOptions.map((energy) => {
                    const active = plan.energy === energy.id;

                    return (
                      <button
                        key={energy.id}
                        className={`rounded-2xl border p-3 text-left transition ${
                          active
                            ? "border-emerald-200/35 bg-emerald-200/[0.10]"
                            : "border-white/10 bg-white/[0.045] hover:bg-white/[0.075]"
                        }`}
                        type="button"
                        onClick={() => changeEnergy(energy.id)}
                      >
                        <span className="block text-sm font-semibold text-cream-100">{energy.label}</span>
                        <span className="mt-1 block text-xs leading-5 text-cream-100/50">{energy.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {dailySoftPlanSteps.map((step) => {
                const completed = plan.completedSteps.includes(step.id);

                return (
                  <SoftButton
                    key={step.id}
                    variant={completed ? "secondary" : "ghost"}
                    onClick={() => completeStep(step)}
                  >
                    {completed ? `${step.title} done` : `Mark ${step.title}`}
                  </SoftButton>
                );
              })}

              <SoftButton variant="ghost" onClick={resetPlan}>
                Reset today
              </SoftButton>
            </div>
          </div>
        ) : null}
      </GlassCard>

      <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
        <GlassCard className="bg-white/[0.035]">
          <p className="font-display text-3xl font-semibold text-cream-100">Breathe</p>
          <p className="mt-3 text-sm leading-6 text-cream-100/58">Start with one slow minute.</p>
        </GlassCard>

        <GlassCard className="bg-white/[0.035]">
          <p className="font-display text-3xl font-semibold text-cream-100">Room</p>
          <p className="mt-3 text-sm leading-6 text-cream-100/58">Set the space around you.</p>
        </GlassCard>

        <GlassCard className="bg-white/[0.035]">
          <p className="font-display text-3xl font-semibold text-cream-100">Mira</p>
          <p className="mt-3 text-sm leading-6 text-cream-100/58">Get softer words when needed.</p>
        </GlassCard>
      </div>

      <footer className="mx-auto mt-8 max-w-5xl">
        <GlassCard className="border-rose-200/20 bg-rose-200/[0.07] text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-100/70">Made with love</p>
          <p className="mt-3 font-display text-2xl font-semibold tracking-[-0.02em] text-cream-100">
            For Tanisha Brahma.
          </p>
          <p className="mt-2 text-sm leading-6 text-cream-100/60">Built by Raif Mondal.</p>
        </GlassCard>
      </footer>
    </section>
  );
}
