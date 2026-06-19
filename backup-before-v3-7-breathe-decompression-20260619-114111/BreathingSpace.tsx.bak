import { useEffect, useState } from "react";
import { BreathingOrb } from "./BreathingOrb";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

type BreathingSpaceProps = {
  reducedMotion: boolean;
  onOpenRoom: () => void;
};

const phases = [
  { label: "Inhale gently", duration: 4 },
  { label: "Hold softly", duration: 1 },
  { label: "Exhale slowly", duration: 6 },
];

export function BreathingSpace({ reducedMotion, onOpenRoom }: BreathingSpaceProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(phases[0].duration);

  useEffect(() => {
    setSecondsLeft(phases[phaseIndex].duration);
  }, [phaseIndex]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current > 1) return current - 1;
        setPhaseIndex((previous) => (previous + 1) % phases.length);
        return 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const phase = phases[phaseIndex];

  return (
    <section className="mx-auto grid min-h-[calc(100vh-7rem)] w-full max-w-6xl place-items-center px-5 pb-36 pt-10 sm:px-8">
      <div className="w-full text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">Breathing space</p>
        <h2 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100 sm:text-7xl">
          Follow the soft light.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-cream-100/70">
          Let the orb set the pace. Inhale for four, hold for one, exhale for six.
        </p>

        <BreathingOrb reducedMotion={reducedMotion} />

        <GlassCard className="mx-auto max-w-xl p-5">
          <div aria-live="polite" className="font-display text-4xl font-semibold text-cream-100">
            {phase.label}
          </div>
          <p className="mt-2 text-cream-100/60">{secondsLeft} second{secondsLeft === 1 ? "" : "s"}</p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <SoftButton onClick={onOpenRoom}>Open comfort room</SoftButton>
            <SoftButton variant="secondary" onClick={() => setPhaseIndex(0)}>
              Restart breath
            </SoftButton>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
