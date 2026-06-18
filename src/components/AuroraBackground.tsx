import type { EnvironmentId } from "../types/app";

type AuroraBackgroundProps = {
  environment: EnvironmentId;
  reducedMotion: boolean;
};

const environmentClass: Record<EnvironmentId, string> = {
  rain: "from-slate-950 via-indigo-950 to-rose-950",
  forest: "from-emerald-950 via-slate-950 to-violet-950",
  ocean: "from-blue-950 via-cyan-950 to-violet-950",
  fireplace: "from-stone-950 via-amber-950 to-rose-950",
  night: "from-slate-950 via-violet-950 to-indigo-950",
};

export function AuroraBackground({ environment, reducedMotion }: AuroraBackgroundProps) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-[#070A1A]">
      <div className={`absolute inset-0 bg-gradient-to-br ${environmentClass[environment]} opacity-95`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(244,184,198,0.22),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(185,167,255,0.24),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(217,160,111,0.18),transparent_38%)]" />
      <div
        className={`absolute -left-32 top-12 h-96 w-96 rounded-full bg-rose-300/20 blur-3xl ${
          reducedMotion ? "" : "motion-safe:animate-float-slow"
        }`}
      />
      <div
        className={`absolute -right-24 bottom-8 h-[28rem] w-[28rem] rounded-full bg-violet-300/20 blur-3xl ${
          reducedMotion ? "" : "motion-safe:animate-float-delayed"
        }`}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px] opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,10,26,0.42)_70%,rgba(7,10,26,0.78)_100%)]" />
    </div>
  );
}
