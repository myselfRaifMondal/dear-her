import type { Screen } from "../types/app";

type DockItem = {
  id: Screen;
  label: string;
  icon: string;
};

const items: DockItem[] = [
  { id: "room", label: "Room", icon: "◐" },
  { id: "breathe", label: "Breathe", icon: "○" },
  { id: "sounds", label: "Sounds", icon: "♪" },
  { id: "memories", label: "Memories", icon: "✧" },
  { id: "messages", label: "Messages", icon: "♡" },
  { id: "favorites", label: "Favorites", icon: "⋆" },
  { id: "activities", label: "Calm", icon: "☾" },
];

type ComfortDockProps = {
  activeScreen: Screen;
  onChangeScreen: (screen: Screen) => void;
};

export function ComfortDock({ activeScreen, onChangeScreen }: ComfortDockProps) {
  return (
    <nav
      aria-label="Comfort sections"
      className="comfort-dock fixed inset-x-0 bottom-3 z-30 mx-auto w-[calc(100%-1rem)] max-w-5xl rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-2 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:bottom-6 sm:w-[calc(100%-2rem)]"
    >
      <div className="flex gap-1 overflow-x-auto rounded-[1.25rem] p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const active = activeScreen === item.id;

          return (
            <button
              key={item.id}
              type="button"
              aria-current={active ? "page" : undefined}
              className={`group relative flex min-h-12 min-w-[4.25rem] flex-shrink-0 flex-col items-center justify-center gap-0.5 rounded-full px-4 text-xs font-semibold transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200 sm:min-w-0 sm:flex-row sm:gap-2 sm:text-sm ${
                active
                  ? "bg-cream-100 text-slate-950 shadow-[0_14px_34px_rgba(246,232,216,0.24)]"
                  : "text-cream-100/68 hover:bg-white/10 hover:text-cream-100"
              }`}
              onClick={() => onChangeScreen(item.id)}
            >
              <span className="text-base leading-none sm:text-sm">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
