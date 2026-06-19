import { useState, type ReactNode } from "react";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

type FounderGateProps = {
  enabled: boolean;
  onUnlock: (code: string) => boolean;
  children: ReactNode;
};

export function FounderGate({ enabled, onUnlock, children }: FounderGateProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (enabled) {
    return <>{children}</>;
  }

  function submit(): void {
    const unlocked = onUnlock(code);

    if (!unlocked) {
      setError("That founder code did not unlock testing mode.");
      return;
    }

    setError(null);
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-7rem)] w-full max-w-5xl place-items-center px-5 pb-36 pt-20 sm:px-8">
      <GlassCard className="w-full max-w-2xl border-rose-200/20 bg-rose-200/[0.07] p-7 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">Founder mode</p>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100">
          This room is only for testing.
        </h1>
        <p className="mt-5 leading-7 text-cream-100/70">
          Feedback and insights are hidden from normal users so Dear Her feels like a soft sanctuary, not a testing dashboard.
        </p>

        <div className="mt-7 space-y-4">
          <label className="block text-sm font-semibold text-cream-100/75">
            Founder access code
            <input
              className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
              type="password"
              value={code}
              onChange={(event) => setCode(event.currentTarget.value)}
              placeholder="Enter founder code"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  submit();
                }
              }}
            />
          </label>

          {error ? (
            <div className="rounded-3xl border border-rose-200/20 bg-rose-200/[0.10] p-4 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <SoftButton onClick={submit} disabled={!code.trim()}>
            Unlock testing mode
          </SoftButton>
        </div>
      </GlassCard>
    </section>
  );
}
