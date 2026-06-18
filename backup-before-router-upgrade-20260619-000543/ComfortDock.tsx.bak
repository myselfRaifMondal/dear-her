import type { Screen } from "../types/app";

type DockItem = {
  id: Screen;
  label: string;
};

const items: DockItem[] = [
  { id: "room", label: "Room" },
  { id: "breathe", label: "Breathe" },
  { id: "sounds", label: "Sounds" },
  { id: "memories", label: "Memories" },
  { id: "messages", label: "Messages" },
  { id: "favorites", label: "Favorites" },
  { id: "activities", label: "Activities" },
];

type ComfortDockProps = {
  activeScreen: Screen;
  onChangeScreen: (screen: Screen) => void;
};

export function ComfortDock({ activeScreen, onChangeScreen }: ComfortDockProps) {
  return (
    <nav
      aria-label="Comfort sections"
      className="fixed inset-x-0 bottom-4 z-30 mx-auto w-[calc(100%-1.5rem)] max-w-5xl rounded-[1.75rem] border border-white/10 bg-slate-950/50 p-2 shadow-[0_20px_80px_rgba(0,0,0,0.38)] backdrop-blur-2xl sm:bottom-6"
    >
      <div className="flex gap-1 overflow-x-auto rounded-[1.25rem] p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const active = activeScreen === item.id;
          return (
            <button
              key={item.id}
              className={`min-h-11 flex-shrink-0 rounded-full px-4 text-sm font-semibold transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200 ${
                active
                  ? "bg-cream-100 text-slate-950 shadow-[0_12px_30px_rgba(246,232,216,0.22)]"
                  : "text-cream-100/70 hover:bg-white/10 hover:text-cream-100"
              }`}
              onClick={() => onChangeScreen(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
