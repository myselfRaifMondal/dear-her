type BreathingOrbProps = {
  reducedMotion: boolean;
};

export function BreathingOrb({ reducedMotion }: BreathingOrbProps) {
  return (
    <div className="relative mx-auto flex h-72 w-72 items-center justify-center sm:h-96 sm:w-96" aria-hidden="true">
      <div
        className={`absolute inset-7 rounded-full bg-gradient-to-br from-rose-200/40 via-lavender-200/40 to-cyan-100/20 blur-2xl ${
          reducedMotion ? "" : "motion-safe:animate-breathe-glow"
        }`}
      />
      <div
        className={`relative flex h-44 w-44 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-[inset_0_0_40px_rgba(255,255,255,0.16),0_30px_90px_rgba(185,167,255,0.26)] backdrop-blur-2xl sm:h-56 sm:w-56 ${
          reducedMotion ? "" : "motion-safe:animate-breathe"
        }`}
      >
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-cream-100/70 to-rose-200/50 blur-sm" />
      </div>
    </div>
  );
}
