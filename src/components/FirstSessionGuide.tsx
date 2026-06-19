import { useState } from "react";
import { useLocation } from "react-router-dom";
import { dismissFirstSessionGuide, shouldShowFirstSessionGuide } from "../lib/onboarding";
import { trackEvent } from "../lib/analytics";
import type { Screen } from "../types/app";
import { SoftButton } from "./SoftButton";

type FirstSessionGuideProps = {
  onNavigate: (screen: Screen) => void;
};

export function FirstSessionGuide({ onNavigate }: FirstSessionGuideProps) {
  const location = useLocation();
  const [visible, setVisible] = useState(() => shouldShowFirstSessionGuide());

  const hiddenRoutes = ["/onboarding", "/feedback", "/insights", "/sync"];
  const shouldHideOnRoute = hiddenRoutes.some((route) => location.pathname.startsWith(route));

  if (!visible || shouldHideOnRoute) return null;

  function dismiss(): void {
    dismissFirstSessionGuide();
    setVisible(false);
    trackEvent("first_session_guide_dismissed", {
      path: location.pathname,
    });
  }

  function start(): void {
    trackEvent("first_session_guide_started", {
      path: location.pathname,
    });

    onNavigate("onboarding");
  }

  function breatheNow(): void {
    dismiss();
    onNavigate("breathe");
  }

  return (
    <div className="fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[65] mx-auto max-w-xl sm:bottom-6 sm:left-auto sm:right-6 sm:mx-0">
      <div className="rounded-[2rem] border border-rose-200/20 bg-slate-950/82 p-4 shadow-[0_28px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
        <div className="flex gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-rose-200/15 text-xl">♡</div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-cream-100">New here?</p>
            <p className="mt-1 text-sm leading-6 text-cream-100/64">
              Take a 30-second soft setup, or start breathing right away.
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <SoftButton onClick={start}>Guide me</SoftButton>
              <SoftButton variant="secondary" onClick={breatheNow}>
                Breathe now
              </SoftButton>
              <SoftButton variant="ghost" onClick={dismiss}>
                Not now
              </SoftButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
