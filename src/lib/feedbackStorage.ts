export type ComfortRating = "1" | "2" | "3" | "4" | "5";

export type FeedbackEntry = {
  id: string;
  createdAt: string;
  comfortRating: ComfortRating;
  mostUsefulScreen: string;
  calmingMoment: string;
  confusingMoment: string;
  wouldUseAgain: boolean;
  improvement: string;
};

const feedbackKey = "dear-her-mvp:feedback";

function readFeedback(): FeedbackEntry[] {
  try {
    const raw = window.localStorage.getItem(feedbackKey);
    return raw ? (JSON.parse(raw) as FeedbackEntry[]) : [];
  } catch {
    return [];
  }
}

function writeFeedback(entries: FeedbackEntry[]): void {
  window.localStorage.setItem(feedbackKey, JSON.stringify(entries));
}

export function loadFeedback(): FeedbackEntry[] {
  return readFeedback();
}

export function saveFeedback(entry: FeedbackEntry): FeedbackEntry[] {
  const updated = [entry, ...readFeedback()].slice(0, 100);
  writeFeedback(updated);
  return updated;
}

export function clearFeedback(): void {
  window.localStorage.removeItem(feedbackKey);
}

export function downloadFeedback(): void {
  const entries = readFeedback();

  const blob = new Blob(
    [
      JSON.stringify(
        {
          product: "Dear Her",
          type: "beta_feedback",
          exportedAt: new Date().toISOString(),
          totalEntries: entries.length,
          entries,
        },
        null,
        2,
      ),
    ],
    { type: "application/json" },
  );

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `dear-her-beta-feedback-${new Date().toISOString().slice(0, 10)}.json`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.URL.revokeObjectURL(url);
}
