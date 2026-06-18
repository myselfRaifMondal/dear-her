import { SoftButton } from "./SoftButton";

type TopBarProps = {
  onOpenSettings: () => void;
};

export function TopBar({ onOpenSettings }: TopBarProps) {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
      <button
        className="rounded-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-200"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Dear Her home"
      >
        <span className="font-display text-2xl font-semibold tracking-wide text-cream-100">Dear Her</span>
        <span className="ml-3 hidden text-xs uppercase tracking-[0.35em] text-cream-100/50 sm:inline">Sanctuary</span>
      </button>
      <SoftButton variant="ghost" onClick={onOpenSettings} aria-label="Open settings">
        Settings
      </SoftButton>
    </header>
  );
}
