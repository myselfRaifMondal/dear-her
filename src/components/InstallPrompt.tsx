import { useEffect, useMemo, useState } from "react";
import { SoftButton } from "./SoftButton";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const dismissKey = "dear-her-mvp:install-prompt-dismissed";

function isStandalone(): boolean {
  const standaloneDisplay = window.matchMedia("(display-mode: standalone)").matches;
  const navigatorStandalone =
    "standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

  return standaloneDisplay || navigatorStandalone;
}

function isIosDevice(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(() => window.localStorage.getItem(dismissKey) === "true");

  const visible = useMemo(() => {
    if (dismissed) return false;
    if (isStandalone()) return false;
    return Boolean(deferredPrompt) || showIosHint;
  }, [deferredPrompt, dismissed, showIosHint]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event): void => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const iosHintTimer = window.setTimeout(() => {
      if (isIosDevice() && !isStandalone()) {
        setShowIosHint(true);
      }
    }, 2600);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.clearTimeout(iosHintTimer);
    };
  }, []);

  function dismiss(): void {
    window.localStorage.setItem(dismissKey, "true");
    setDismissed(true);
  }

  async function install(): Promise<void> {
    if (!deferredPrompt) {
      setShowIosHint(true);
      return;
    }

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  }

  if (!visible) return null;

  return (
    <aside
      className="fixed bottom-28 right-4 z-40 w-[calc(100%-2rem)] max-w-sm rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-4 text-cream-100 shadow-[0_24px_90px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:bottom-8 sm:right-6"
      aria-label="Install Dear Her"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-200/75">Open faster</p>
          <p className="mt-2 font-display text-2xl font-semibold">Add Dear Her to your phone.</p>
          <p className="mt-2 text-sm leading-6 text-cream-100/65">
            {showIosHint && !deferredPrompt
              ? "On iPhone, tap Share, then Add to Home Screen."
              : "Install it like a quiet little comfort app."}
          </p>
        </div>

        <button
          type="button"
          className="rounded-full px-3 py-2 text-sm font-semibold text-cream-100/55 transition hover:bg-white/10 hover:text-cream-100"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
        >
          ✕
        </button>
      </div>

      <div className="mt-4 flex gap-3">
        {deferredPrompt ? (
          <SoftButton onClick={() => void install()}>Install</SoftButton>
        ) : (
          <SoftButton variant="secondary" onClick={() => setShowIosHint(true)}>
            Show steps
          </SoftButton>
        )}
        <SoftButton variant="ghost" onClick={dismiss}>
          Later
        </SoftButton>
      </div>
    </aside>
  );
}
