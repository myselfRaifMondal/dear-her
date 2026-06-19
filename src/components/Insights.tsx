import { useMemo, useState } from "react";
import { clearAnalytics, downloadAnalytics, readAnalytics } from "../lib/analytics";
import { clearFeedback, downloadFeedback, loadFeedback } from "../lib/feedbackStorage";
import { createInsightSummary } from "../lib/insights";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

export function Insights() {
  const [refreshToken, setRefreshToken] = useState(0);

  const summary = useMemo(() => createInsightSummary(), [refreshToken]);
  const analytics = useMemo(() => readAnalytics().slice(-12).reverse(), [refreshToken]);
  const feedback = useMemo(() => loadFeedback().slice(0, 6), [refreshToken]);

  function refresh(): void {
    setRefreshToken((value) => value + 1);
  }

  function clearAll(): void {
    const confirmed = window.confirm("Clear local analytics and beta feedback from this browser?");

    if (!confirmed) return;

    clearAnalytics();
    clearFeedback();
    refresh();
  }

  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-7xl px-5 pb-36 pt-10 sm:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">Insights</p>
        <h2 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100 sm:text-7xl">
          What are testers feeling?
        </h2>
        <p className="mt-5 leading-7 text-cream-100/70">
          A private local dashboard for MVP testing. Nothing here is sent to a server.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <GlassCard>
          <p className="text-sm font-semibold text-cream-100/55">Local events</p>
          <p className="mt-3 font-display text-5xl font-semibold text-cream-100">{summary.totalEvents}</p>
        </GlassCard>

        <GlassCard>
          <p className="text-sm font-semibold text-cream-100/55">Feedback entries</p>
          <p className="mt-3 font-display text-5xl font-semibold text-cream-100">{summary.totalFeedback}</p>
        </GlassCard>

        <GlassCard>
          <p className="text-sm font-semibold text-cream-100/55">Avg comfort</p>
          <p className="mt-3 font-display text-5xl font-semibold text-cream-100">
            {summary.averageComfortRating ?? "—"}
          </p>
        </GlassCard>

        <GlassCard>
          <p className="text-sm font-semibold text-cream-100/55">Would use again</p>
          <p className="mt-3 font-display text-5xl font-semibold text-cream-100">
            {summary.wouldUseAgainPercent === null ? "—" : `${summary.wouldUseAgainPercent}%`}
          </p>
        </GlassCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <p className="font-display text-3xl font-semibold text-cream-100">Most visited screens</p>
          <div className="mt-5 space-y-3">
            {summary.mostVisitedScreens.length === 0 ? (
              <p className="text-sm text-cream-100/60">No page views tracked yet.</p>
            ) : (
              summary.mostVisitedScreens.map((item) => (
                <div key={item.screen} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3">
                  <span className="capitalize text-cream-100/75">{item.screen}</span>
                  <span className="font-semibold text-cream-100">{item.count}</span>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <p className="font-display text-3xl font-semibold text-cream-100">Most used actions</p>
          <div className="mt-5 space-y-3">
            {summary.mostUsedActions.length === 0 ? (
              <p className="text-sm text-cream-100/60">No actions tracked yet.</p>
            ) : (
              summary.mostUsedActions.map((item) => (
                <div key={item.action} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3">
                  <span className="text-cream-100/75">{item.action.replaceAll("_", " ")}</span>
                  <span className="font-semibold text-cream-100">{item.count}</span>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <p className="font-display text-3xl font-semibold text-cream-100">Latest feedback</p>
          <div className="mt-5 space-y-3">
            {feedback.length === 0 ? (
              <p className="text-sm text-cream-100/60">No beta feedback saved yet.</p>
            ) : (
              feedback.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-sm leading-6 text-cream-100/70">
                  <p className="font-semibold text-cream-100">Comfort {item.comfortRating}/5 · {item.mostUsefulScreen}</p>
                  <p className="mt-2">{item.calmingMoment || "No calming note."}</p>
                  {item.improvement ? <p className="mt-2 text-cream-100/55">Improve: {item.improvement}</p> : null}
                </div>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <p className="font-display text-3xl font-semibold text-cream-100">Latest events</p>
          <div className="mt-5 space-y-3">
            {analytics.length === 0 ? (
              <p className="text-sm text-cream-100/60">No local analytics yet.</p>
            ) : (
              analytics.map((event) => (
                <div key={event.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-sm leading-6 text-cream-100/70">
                  <p className="font-semibold text-cream-100">{event.name.replaceAll("_", " ")}</p>
                  <p className="text-cream-100/50">{new Date(event.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-6 flex flex-col gap-3 sm:flex-row">
        <SoftButton onClick={refresh}>Refresh insights</SoftButton>
        <SoftButton variant="secondary" onClick={downloadAnalytics}>Export analytics</SoftButton>
        <SoftButton variant="secondary" onClick={downloadFeedback}>Export feedback</SoftButton>
        <SoftButton variant="ghost" onClick={clearAll}>Clear testing data</SoftButton>
      </GlassCard>
    </section>
  );
}
