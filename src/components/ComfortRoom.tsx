import { environments } from "../data/content";
import type { EnvironmentId, Mood, Screen } from "../types/app";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

type ComfortRoomProps = {
  environment: EnvironmentId;
  mood: Mood | null;
  onChangeEnvironment: (environment: EnvironmentId) => void;
  onNavigate: (screen: Screen) => void;
  isAmbiencePlaying: boolean;
  onToggleAmbience: () => void;
};

export function ComfortRoom({
  environment,
  mood,
  onChangeEnvironment,
  onNavigate,
  isAmbiencePlaying,
  onToggleAmbience,
}: ComfortRoomProps) {
  const activeEnvironment = environments.find((item) => item.id === environment) ?? environments[0];

  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-7xl px-5 pb-36 pt-8 sm:px-8">
      <div className="grid items-stretch gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <GlassCard className="relative min-h-[34rem] overflow-hidden p-6 sm:p-8">
          <div className={`absolute inset-0 bg-gradient-to-br ${activeEnvironment.palette} opacity-70`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.20),transparent_20%),radial-gradient(circle_at_20%_80%,rgba(244,184,198,0.20),transparent_28%),radial-gradient(circle_at_85%_70%,rgba(185,167,255,0.18),transparent_24%)]" />
          <div className="absolute left-8 top-10 h-28 w-28 rounded-full bg-cream-100/25 blur-2xl motion-safe:animate-lamp-pulse" />
          <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-black/40 to-transparent" />

          <div className="relative flex h-full min-h-[30rem] flex-col justify-between">
            <div>
              <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-cream-100/80 backdrop-blur-xl">
                Feeling: {activeEnvironment.feeling}
              </span>
              <h2 className="mt-6 max-w-2xl font-display text-6xl font-semibold tracking-[-0.04em] text-cream-100 sm:text-7xl">
                {activeEnvironment.name}
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-cream-100/70">{activeEnvironment.description}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <SoftButton onClick={onToggleAmbience}>{isAmbiencePlaying ? "Pause ambience" : "Play ambience"}</SoftButton>
              <SoftButton variant="secondary" onClick={() => onNavigate("breathe")}>
                Start breathing
              </SoftButton>
              <SoftButton variant="secondary" onClick={() => onNavigate("messages")}>
                Read comfort
              </SoftButton>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-200/70">Today&apos;s softness</p>
            <h3 className="mt-3 font-display text-4xl font-semibold text-cream-100">
              {mood ? `You chose “${mood}”.` : "Start wherever you are."}
            </h3>
            <p className="mt-4 leading-7 text-cream-100/70">
              This app will not ask you to perform, track, or explain. Choose only what feels kind right now.
            </p>
          </GlassCard>

          <GlassCard>
            <h3 className="font-display text-3xl font-semibold text-cream-100">Choose your room</h3>
            <div className="mt-5 grid gap-3">
              {environments.map((item) => {
                const active = item.id === environment;
                return (
                  <button
                    key={item.id}
                    className={`rounded-3xl border p-4 text-left transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-200 ${
                      active ? "border-cream-100/70 bg-cream-100/10" : "border-white/10 bg-white/[0.045] hover:bg-white/[0.08]"
                    }`}
                    onClick={() => onChangeEnvironment(item.id)}
                  >
                    <span className="block font-semibold text-cream-100">{item.name}</span>
                    <span className="mt-1 block text-sm leading-6 text-cream-100/60">{item.description}</span>
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
