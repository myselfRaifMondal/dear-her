import { useMemo, useState } from "react";
import { trackEvent } from "../lib/analytics";
import type { Screen } from "../types/app";

type ComfortDockProps = {
  activeScreen?: Screen;
  currentScreen?: Screen;
  screen?: Screen;

  // New + backward-compatible navigation props
  onNavigate?: (screen: Screen) => void;
  onChangeScreen?: (screen: Screen) => void;

  founderMode?: boolean;
};

type DockItem = {
  screen: Screen;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
};

const primaryItems: DockItem[] = [
  {
    screen: "welcome",
    label: "Today",
    shortLabel: "Today",
    icon: "◐",
    description: "Start softly",
  },
  {
    screen: "breathe",
    label: "Breathe",
    shortLabel: "Breathe",
    icon: "○",
    description: "One calm minute",
  },
  {
    screen: "room",
    label: "Room",
    shortLabel: "Room",
    icon: "☾",
    description: "Set the space",
  },
  {
    screen: "you",
    label: "You",
    shortLabel: "You",
    icon: "✦",
    description: "Keep what helps",
  },
];

const secondaryItems: DockItem[] = [
  {
    screen: "mira",
    label: "Mira",
    shortLabel: "Mira",
    icon: "✧",
    description: "Softer words",
  },
  {
    screen: "care",
    label: "Care Package",
    shortLabel: "Care",
    icon: "♡",
    description: "Make something soft",
  },
  {
    screen: "sync",
    label: "Cloud Sync",
    shortLabel: "Sync",
    icon: "↺",
    description: "Optional backup",
  },
  {
    screen: "waitlist",
    label: "Beta Waitlist",
    shortLabel: "Beta",
    icon: "⋆",
    description: "Join testing",
  },
];

const founderItems: DockItem[] = [
  {
    screen: "feedback",
    label: "Feedback",
    shortLabel: "Feedback",
    icon: "✎",
    description: "Beta notes",
  },
  {
    screen: "insights",
    label: "Insights",
    shortLabel: "Insights",
    icon: "⌁",
    description: "Local signals",
  },
];

export function ComfortDock({
  activeScreen,
  currentScreen,
  screen,
  onNavigate,
  onChangeScreen,
  founderMode = false,
}: ComfortDockProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  const active = activeScreen ?? currentScreen ?? screen ?? "welcome";

  const moreItems = useMemo(() => {
    return founderMode ? [...secondaryItems, ...founderItems] : secondaryItems;
  }, [founderMode]);

  const moreActive = moreItems.some((item) => item.screen === active);

  function navigate(item: DockItem, source: "primary" | "secondary"): void {
    setMoreOpen(false);

    trackEvent(source === "primary" ? "dock_navigation_clicked" : "dock_secondary_navigation_clicked", {
      screen: item.screen,
      label: item.label,
    });

    const navigationHandler = onNavigate ?? onChangeScreen;

    if (!navigationHandler) return;

    navigationHandler(item.screen);
  }

  function toggleMore(): void {
    const next = !moreOpen;
    setMoreOpen(next);

    trackEvent(next ? "dock_more_opened" : "dock_more_closed", {
      active,
    });
  }

  return (
    <>
      {moreOpen ? (
        <button
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px]"
          type="button"
          aria-label="Close more navigation"
          onClick={toggleMore}
        />
      ) : null}

      <nav
        className="fixed inset-x-0 bottom-4 z-50 mx-auto w-[min(94vw,42rem)] px-3"
        aria-label="Dear Her navigation"
      >
        {moreOpen ? (
          <div className="mb-3 rounded-[2rem] border border-white/10 bg-slate-950/88 p-3 shadow-2xl shadow-black/30 backdrop-blur-2xl">
            <div className="mb-3 flex items-center justify-between px-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cream-100/42">More spaces</p>
                <p className="mt-1 text-sm text-cream-100/62">Only open what feels useful.</p>
              </div>

              <button
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.055] text-cream-100/70 transition hover:bg-white/[0.09] hover:text-cream-100"
                type="button"
                onClick={toggleMore}
                aria-label="Close more navigation"
              >
                ×
              </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {moreItems.map((item) => {
                const isActive = active === item.screen;

                return (
                  <button
                    key={item.screen}
                    className={`rounded-[1.45rem] border p-4 text-left transition ${
                      isActive
                        ? "border-rose-200/40 bg-rose-200/[0.12]"
                        : "border-white/10 bg-white/[0.045] hover:bg-white/[0.075]"
                    }`}
                    type="button"
                    onClick={() => navigate(item, "secondary")}
                  >
                    <span className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] text-lg text-cream-100">
                        {item.icon}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-cream-100">{item.label}</span>
                        <span className="mt-1 block text-xs leading-5 text-cream-100/48">{item.description}</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/82 p-2 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div className="grid grid-cols-5 gap-1">
            {primaryItems.map((item) => {
              const isActive = active === item.screen;

              return (
                <button
                  key={item.screen}
                  className={`group flex min-h-[4.25rem] flex-col items-center justify-center rounded-[1.45rem] px-2 text-center transition ${
                    isActive
                      ? "bg-cream-100 text-slate-950"
                      : "text-cream-100/55 hover:bg-white/[0.07] hover:text-cream-100"
                  }`}
                  type="button"
                  onClick={() => navigate(item, "primary")}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="text-xl leading-none">{item.icon}</span>
                  <span className="mt-1 text-xs font-semibold">{item.shortLabel}</span>
                </button>
              );
            })}

            <button
              className={`group flex min-h-[4.25rem] flex-col items-center justify-center rounded-[1.45rem] px-2 text-center transition ${
                moreActive || moreOpen
                  ? "bg-rose-200/[0.16] text-cream-100"
                  : "text-cream-100/55 hover:bg-white/[0.07] hover:text-cream-100"
              }`}
              type="button"
              onClick={toggleMore}
              aria-expanded={moreOpen}
              aria-label="Open more spaces"
            >
              <span className="text-xl leading-none">•••</span>
              <span className="mt-1 text-xs font-semibold">More</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
