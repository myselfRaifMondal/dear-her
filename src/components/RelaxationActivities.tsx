import { activities } from "../data/content";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";
import type { Screen } from "../types/app";

type RelaxationActivitiesProps = {
  onNavigate: (screen: Screen) => void;
};

export function RelaxationActivities({ onNavigate }: RelaxationActivitiesProps) {
  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-6xl px-5 pb-36 pt-10 sm:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">Relaxation activities</p>
        <h2 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100 sm:text-7xl">
          Tiny rituals, not tasks.
        </h2>
        <p className="mt-5 leading-7 text-cream-100/70">
          These are intentionally small. No streaks, no productivity pressure, no perfect routine required.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {activities.map((activity) => (
          <GlassCard key={activity.title}>
            <p className="font-display text-4xl font-semibold text-cream-100">{activity.title}</p>
            <p className="mt-4 leading-7 text-cream-100/60">{activity.body}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-cream-100">Need the simplest one?</p>
          <p className="mt-1 text-sm text-cream-100/60">Start with one guided breathing cycle.</p>
        </div>
        <SoftButton onClick={() => onNavigate("breathe")}>Open breathing space</SoftButton>
      </GlassCard>
    </section>
  );
}
