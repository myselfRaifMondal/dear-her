import { trackEvent } from "../lib/analytics";

export function BetaBadge() {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-full border border-rose-200/20 bg-rose-200/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-100/80 transition hover:bg-rose-200/[0.12]"
      type="button"
      onClick={() => {
        trackEvent("beta_badge_clicked", {
          placement: "landing",
        });
      }}
      title="Dear Her is currently in public beta"
    >
      <span className="h-2 w-2 rounded-full bg-emerald-200 shadow-[0_0_18px_rgba(167,243,208,0.75)]" />
      Public beta
    </button>
  );
}
