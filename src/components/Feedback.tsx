import { useState } from "react";
import { trackEvent } from "../lib/analytics";
import { downloadFeedback, saveFeedback, type ComfortRating } from "../lib/feedbackStorage";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

const screens = [
  "Welcome",
  "Mood Check-In",
  "Breathing Space",
  "Comfort Room",
  "Soundscapes",
  "Memories",
  "Comfort Messages",
  "Favorite Things",
  "Mira",
  "Cloud Sync",
];

export function Feedback() {
  const [comfortRating, setComfortRating] = useState<ComfortRating>("5");
  const [mostUsefulScreen, setMostUsefulScreen] = useState("Breathing Space");
  const [calmingMoment, setCalmingMoment] = useState("");
  const [confusingMoment, setConfusingMoment] = useState("");
  const [wouldUseAgain, setWouldUseAgain] = useState(true);
  const [improvement, setImprovement] = useState("");
  const [saved, setSaved] = useState(false);

  function submitFeedback(): void {
    saveFeedback({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      comfortRating,
      mostUsefulScreen,
      calmingMoment: calmingMoment.trim(),
      confusingMoment: confusingMoment.trim(),
      wouldUseAgain,
      improvement: improvement.trim(),
    });

    setSaved(true);
    trackEvent("feedback_submitted", {
      comfortRating: Number(comfortRating),
      mostUsefulScreen,
      wouldUseAgain,
    });

    setCalmingMoment("");
    setConfusingMoment("");
    setImprovement("");
  }

  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-6xl px-5 pb-36 pt-10 sm:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">Beta feedback</p>
        <h2 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100 sm:text-7xl">
          Did Dear Her feel softer?
        </h2>
        <p className="mt-5 leading-7 text-cream-100/70">
          Use this during testing. Ask each person to spend two minutes in the app, then answer these softly.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <GlassCard>
          {saved ? (
            <div className="mb-5 rounded-3xl border border-emerald-200/20 bg-emerald-200/[0.08] p-4 text-sm leading-6 text-cream-100/75">
              Feedback saved locally. You can export all beta feedback anytime.
            </div>
          ) : null}

          <div className="space-y-5">
            <label className="block text-sm font-semibold text-cream-100/75">
              How comforting did it feel?
              <select
                className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-cream-100 outline-none focus:border-rose-200/70"
                value={comfortRating}
                onChange={(event) => setComfortRating(event.currentTarget.value as ComfortRating)}
              >
                <option value="5">5 — Very comforting</option>
                <option value="4">4 — Comforting</option>
                <option value="3">3 — Somewhat comforting</option>
                <option value="2">2 — Not much</option>
                <option value="1">1 — Did not help</option>
              </select>
            </label>

            <label className="block text-sm font-semibold text-cream-100/75">
              Most useful screen
              <select
                className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-cream-100 outline-none focus:border-rose-200/70"
                value={mostUsefulScreen}
                onChange={(event) => setMostUsefulScreen(event.currentTarget.value)}
              >
                {screens.map((screen) => (
                  <option key={screen} value={screen}>
                    {screen}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-cream-100/75">
              What felt calming?
              <textarea
                className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
                value={calmingMoment}
                onChange={(event) => setCalmingMoment(event.currentTarget.value)}
                placeholder="The breathing orb, rain room, messages..."
              />
            </label>

            <label className="block text-sm font-semibold text-cream-100/75">
              What felt confusing, cringe, or unnecessary?
              <textarea
                className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
                value={confusingMoment}
                onChange={(event) => setConfusingMoment(event.currentTarget.value)}
                placeholder="Anything that broke the comfort feeling..."
              />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.045] p-4 text-cream-100">
              <span>
                <span className="block font-semibold">Would use again?</span>
                <span className="mt-1 block text-sm text-cream-100/60">The core MVP validation question.</span>
              </span>
              <input
                className="h-5 w-5 accent-rose-200"
                type="checkbox"
                checked={wouldUseAgain}
                onChange={(event) => setWouldUseAgain(event.currentTarget.checked)}
              />
            </label>

            <label className="block text-sm font-semibold text-cream-100/75">
              One thing to improve
              <textarea
                className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
                value={improvement}
                onChange={(event) => setImprovement(event.currentTarget.value)}
                placeholder="Make sounds softer, improve mobile nav, add partner messages..."
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <SoftButton onClick={submitFeedback}>Save feedback</SoftButton>
              <SoftButton variant="secondary" onClick={downloadFeedback}>
                Export feedback
              </SoftButton>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="h-fit border-rose-200/20 bg-rose-200/[0.07]">
          <p className="font-display text-3xl font-semibold text-cream-100">How to test this MVP</p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-cream-100/70">
            <p>1. Ask the user to open the app without explaining too much.</p>
            <p>2. Watch what they click in the first 30 seconds.</p>
            <p>3. Ask if it felt comforting or just visually nice.</p>
            <p>4. Ask what felt too much, fake, or confusing.</p>
            <p>5. Save their answers here.</p>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.055] p-4 text-sm leading-6 text-cream-100/65">
            Success target: 3 out of 5 testers should say they would use it again during a difficult day.
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
