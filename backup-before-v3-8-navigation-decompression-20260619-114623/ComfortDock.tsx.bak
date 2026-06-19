import type { Screen } from "../types/app";

type DockItem = {
  id: Screen;
  label: string;
  icon: string;
  founderOnly?: boolean;
};

type ComfortDockProps = {
  activeScreen: Screen;
  onChangeScreen: (screen: Screen) => void;
  founderMode?: boolean;
};

const items: DockItem[] = [
  { id: "welcome", label: "Today", icon: "◐" },
  { id: "breathe", label: "Breathe", icon: "○" },
  { id: "room", label: "Room", icon: "☾" },
  { id: "mira", label: "Mira", icon: "✦" },
  { id: "care", label: "Care", icon: "♡" },
  { id: "you", label: "You", icon: "◌" },
  { id: "feedback", label: "Feedback", icon: "✎", founderOnly: true },
  { id: "insights", label: "Insights", icon: "⌁", founderOnly: true },
];

export function ComfortDock({ activeScreen, onChangeScreen, founderMode = false }: ComfortDockProps) {
  const visibleItems = items.filter((item) => !item.founderOnly || founderMode);

  return (
    <nav
      className="comfort-dock fixed inset-x-3 bottom-3 z-50 mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-slate-950/72 p-2 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:bottom-5 sm:p-3"
      aria-label="Dear Her primary navigation"
    >
      <div className="grid grid-cols-6 gap-1 sm:gap-2">
        {visibleItems.map((item) => {
          const active = activeScreen === item.id;

          return (
            <button
              key={item.id}
              className={`min-h-14 rounded-[1.45rem] px-2 py-2 text-center transition ${
                active
                  ? "bg-cream-100 text-slate-950 shadow-[0_10px_30px_rgba(255,250,243,0.16)]"
                  : "text-cream-100/58 hover:bg-white/[0.07] hover:text-cream-100"
              }`}
              type="button"
              onClick={() => onChangeScreen(item.id)}
              aria-current={active ? "page" : undefined}
            >
              <span className="block text-lg leading-none">{item.icon}</span>
              <span className="mt-1 block text-[0.68rem] font-semibold leading-none sm:text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
