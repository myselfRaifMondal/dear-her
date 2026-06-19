import { readAnalytics, type AnalyticsEvent } from "./analytics";
import { loadFeedback, type FeedbackEntry } from "./feedbackStorage";

export type InsightSummary = {
  totalEvents: number;
  totalFeedback: number;
  mostVisitedScreens: Array<{ screen: string; count: number }>;
  mostUsedActions: Array<{ action: string; count: number }>;
  averageComfortRating: number | null;
  wouldUseAgainPercent: number | null;
};

function countBy<T>(items: T[], getKey: (item: T) => string | null | undefined): Array<{ key: string; count: number }> {
  const map = new Map<string, number>();

  items.forEach((item) => {
    const key = getKey(item);
    if (!key) return;
    map.set(key, (map.get(key) ?? 0) + 1);
  });

  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

function averageRating(feedback: FeedbackEntry[]): number | null {
  if (feedback.length === 0) return null;

  const total = feedback.reduce((sum, item) => sum + Number(item.comfortRating), 0);
  return Math.round((total / feedback.length) * 10) / 10;
}

function wouldUseAgain(feedback: FeedbackEntry[]): number | null {
  if (feedback.length === 0) return null;

  const yes = feedback.filter((item) => item.wouldUseAgain).length;
  return Math.round((yes / feedback.length) * 100);
}

export function createInsightSummary(): InsightSummary {
  const analytics = readAnalytics();
  const feedback = loadFeedback();

  const screens = countBy(analytics, (event: AnalyticsEvent) =>
    event.name === "page_view" && typeof event.payload?.screen === "string" ? event.payload.screen : null,
  );

  const actions = countBy(analytics, (event: AnalyticsEvent) => (event.name !== "page_view" ? event.name : null));

  return {
    totalEvents: analytics.length,
    totalFeedback: feedback.length,
    mostVisitedScreens: screens.slice(0, 8).map((item) => ({ screen: item.key, count: item.count })),
    mostUsedActions: actions.slice(0, 8).map((item) => ({ action: item.key, count: item.count })),
    averageComfortRating: averageRating(feedback),
    wouldUseAgainPercent: wouldUseAgain(feedback),
  };
}
