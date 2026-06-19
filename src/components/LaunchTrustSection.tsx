import { trackEvent } from "../lib/analytics";
import { GlassCard } from "./GlassCard";

const testimonials = [
  {
    quote: "The breathing screen felt genuinely calming, not like another productivity app.",
    label: "Beta tester",
  },
  {
    quote: "The care package idea is the part I would actually share with someone.",
    label: "Early user",
  },
  {
    quote: "It feels private and soft. The app does not ask too much from me.",
    label: "Comfort test",
  },
];

const launchNotes = [
  "Built as a comfort sanctuary, not a medical tool.",
  "Designed for difficult days, low energy, and quiet emotional support.",
  "Local-first by default. Cloud sync is optional.",
];

export function LaunchTrustSection() {
  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
      <GlassCard className="border-rose-200/20 bg-rose-200/[0.07]">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-rose-100/70">Why it exists</p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.035em] text-cream-100 sm:text-5xl">
          A soft place before everything feels too much.
        </h2>

        <div className="mt-6 space-y-3">
          {launchNotes.map((note) => (
            <div key={note} className="rounded-3xl border border-white/10 bg-white/[0.055] p-4 text-sm leading-6 text-cream-100/68">
              {note}
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-4">
        {testimonials.map((item, index) => (
          <button
            key={item.quote}
            className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 text-left transition hover:-translate-y-1 hover:bg-white/[0.07]"
            type="button"
            onClick={() => {
              trackEvent("testimonial_placeholder_clicked", {
                index,
              });
            }}
          >
            <p className="text-lg leading-8 text-cream-100/78">“{item.quote}”</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-cream-100/42">{item.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
