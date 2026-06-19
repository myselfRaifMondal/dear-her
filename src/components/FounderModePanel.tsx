import { useState } from "react";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

type FounderModePanelProps = {
  founderMode: boolean;
  onUnlock: (code: string) => boolean;
  onDisable: () => void;
};

export function FounderModePanel({ founderMode, onUnlock, onDisable }: FounderModePanelProps) {
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  function unlock(): void {
    const unlocked = onUnlock(code);

    if (unlocked) {
      setNotice("Founder mode enabled. Feedback and insights are now visible in the dock.");
      setCode("");
      return;
    }

    setNotice("Founder code did not match.");
  }

  return (
    <GlassCard className="mt-6 border-rose-200/20 bg-rose-200/[0.07]">
      <p className="font-display text-3xl font-semibold text-cream-100">Founder/testing mode</p>
      <p className="mt-2 text-sm leading-6 text-cream-100/65">
        Keep Feedback and Insights hidden from normal users. Unlock them only when testing the MVP.
      </p>

      <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.045] p-4 text-sm leading-6 text-cream-100/70">
        Current mode:{" "}
        <span className="font-semibold text-cream-100">
          {founderMode ? "Founder mode enabled" : "Normal user mode"}
        </span>
      </div>

      {notice ? (
        <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.055] p-4 text-sm text-cream-100/70">
          {notice}
        </div>
      ) : null}

      {founderMode ? (
        <div className="mt-5">
          <SoftButton variant="secondary" onClick={onDisable}>
            Disable founder mode
          </SoftButton>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            className="min-h-12 flex-1 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
            type="password"
            value={code}
            onChange={(event) => setCode(event.currentTarget.value)}
            placeholder="Founder access code"
          />
          <SoftButton onClick={unlock} disabled={!code.trim()}>
            Unlock
          </SoftButton>
        </div>
      )}
    </GlassCard>
  );
}
