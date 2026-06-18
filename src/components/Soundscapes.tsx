import { environments } from "../data/content";
import type { EnvironmentId } from "../types/app";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

type SoundscapesProps = {
  environment: EnvironmentId;
  volume: number;
  isAmbiencePlaying: boolean;
  onEnvironmentChange: (environment: EnvironmentId) => void;
  onVolumeChange: (volume: number) => void;
  onToggleAmbience: () => void;
};

export function Soundscapes({
  environment,
  volume,
  isAmbiencePlaying,
  onEnvironmentChange,
  onVolumeChange,
  onToggleAmbience,
}: SoundscapesProps) {
  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-6xl px-5 pb-36 pt-10 sm:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">Soundscapes</p>
        <h2 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100 sm:text-7xl">
          Let the room sound softer.
        </h2>
        <p className="mt-5 leading-7 text-cream-100/70">
          This MVP uses gentle browser-generated ambience, so it works without downloading audio files first.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {environments.map((item) => {
          const active = item.id === environment;
          return (
            <GlassCard key={item.id} className={`transition duration-300 ${active ? "ring-1 ring-cream-100/50" : ""}`}>
              <div className={`mb-5 h-36 rounded-[1.5rem] bg-gradient-to-br ${item.palette} shadow-inner`} />
              <p className="font-display text-3xl font-semibold text-cream-100">{item.name}</p>
              <p className="mt-2 min-h-14 text-sm leading-6 text-cream-100/60">{item.description}</p>
              <div className="mt-5 flex gap-3">
                <SoftButton variant={active ? "primary" : "secondary"} onClick={() => onEnvironmentChange(item.id)}>
                  {active ? "Selected" : "Select"}
                </SoftButton>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-cream-100">Ambience mixer</p>
          <p className="mt-1 text-sm text-cream-100/60">Start audio from a user tap, then adjust softness.</p>
        </div>
        <div className="flex flex-1 flex-col gap-4 sm:max-w-lg sm:flex-row sm:items-center">
          <label className="flex flex-1 items-center gap-3 text-sm font-semibold text-cream-100/70">
            Volume
            <input
              className="accent-rose-200"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(event) => onVolumeChange(Number(event.currentTarget.value))}
              aria-label="Ambience volume"
            />
          </label>
          <SoftButton onClick={onToggleAmbience}>{isAmbiencePlaying ? "Pause" : "Play"}</SoftButton>
        </div>
      </GlassCard>
    </section>
  );
}
