import { motion } from "motion/react";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";
import type { Screen } from "../types/app";

type WelcomeProps = {
  onNavigate: (screen: Screen) => void;
  reducedMotion: boolean;
};

export function Welcome({ onNavigate, reducedMotion }: WelcomeProps) {
  const animation = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
      };

  return (
    <section className="mx-auto grid min-h-[calc(100vh-7rem)] w-full max-w-7xl place-items-center px-5 pb-32 pt-8 sm:px-8">
      <motion.div className="grid w-full items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]" {...animation}>
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.38em] text-rose-200/80">A soft place to return</p>
          <h1 className="max-w-4xl font-display text-6xl font-semibold leading-[0.92] tracking-[-0.04em] text-cream-100 sm:text-7xl lg:text-8xl">
            Dear Her,
            <span className="block text-cream-100/70">come in softly.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-cream-100/70 sm:text-xl">
            A calming digital sanctuary for cramps, fatigue, emotional heaviness, and difficult days. No tracking. No pressure. Just comfort.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <SoftButton onClick={() => onNavigate("mood")}>Start with how I feel</SoftButton>
            <SoftButton variant="secondary" onClick={() => onNavigate("breathe")}>
              Just help me breathe
            </SoftButton>
          </div>
        </div>

        <GlassCard className="relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-20 -top-16 h-52 w-52 rounded-full bg-rose-200/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-lavender-200/20 blur-3xl" />
          <div className="relative">
            <p className="font-display text-4xl font-semibold leading-tight text-cream-100">Tonight can be smaller.</p>
            <p className="mt-4 leading-7 text-cream-100/70">
              Choose a room, start a breath, play soft ambience, open a memory, or read a message that feels like a warm hand on your shoulder.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Breathing orb",
                "Cozy rooms",
                "Soft soundscapes",
                "Personal memories",
              ].map((item) => (
                <div key={item} className="rounded-3xl border border-white/10 bg-white/[0.055] p-4 text-sm font-medium text-cream-100/80">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </section>
  );
}
