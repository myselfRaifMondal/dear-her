import { useMemo, useState } from "react";
import { trackEvent } from "../lib/analytics";
import {
  createInviteLink,
  exportLocalWaitlistEntries,
  getReferralCodeFromUrl,
  loadLocalWaitlistEntries,
  submitWaitlistEntry,
  type WaitlistInterest,
} from "../lib/waitlist";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import type { Screen } from "../types/app";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

type BetaWaitlistProps = {
  onNavigate: (screen: Screen) => void;
};

const interestOptions: Array<{ value: WaitlistInterest; label: string }> = [
  { value: "comfort", label: "I want a softer comfort space" },
  { value: "care-package", label: "I want to send care packages" },
  { value: "mira", label: "I want to try Mira" },
  { value: "testing", label: "I want to beta test" },
  { value: "partner", label: "I want this for my partner" },
];

export function BetaWaitlist({ onNavigate }: BetaWaitlistProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [interest, setInterest] = useState<WaitlistInterest>("comfort");
  const [reason, setReason] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [localCount, setLocalCount] = useState(() => loadLocalWaitlistEntries().length);

  const referralCode = useMemo(() => getReferralCodeFromUrl(), []);

  async function submit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (busy) return;

    setBusy(true);
    setNotice(null);

    try {
      const result = await submitWaitlistEntry({
        email,
        name,
        interest,
        reason,
      });

      const link = createInviteLink(result.inviteCode);
      setInviteLink(link);
      setLocalCount(loadLocalWaitlistEntries().length);

      if (result.status === "already_joined") {
        setNotice("You are already on the beta waitlist. Here is a fresh invite link you can still share.");
      } else if (result.status === "saved_locally") {
        setNotice("Supabase is not fully available, so this signup was saved locally on this browser.");
      } else {
        setNotice("You are on the beta waitlist. Your invite link is ready.");
      }

      trackEvent("waitlist_submitted", {
        interest,
        storage: result.storage,
        status: result.status,
        referred: Boolean(referralCode),
      });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not join the waitlist.");
      trackEvent("waitlist_failed", {
        interest,
      });
    } finally {
      setBusy(false);
    }
  }

  async function copyInvite(): Promise<void> {
    if (!inviteLink) return;

    try {
      await window.navigator.clipboard.writeText(inviteLink);
      setNotice("Invite link copied.");
      trackEvent("waitlist_invite_copied", {
        method: "clipboard",
      });
    } catch {
      setNotice("Could not copy automatically. Select the link manually.");
    }
  }

  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-7xl px-5 pb-36 pt-10 sm:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">Beta waitlist</p>
        <h2 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100 sm:text-7xl">
          Join the softer beta.
        </h2>
        <p className="mt-5 leading-7 text-cream-100/70">
          Be part of Dear Her’s early testing group. Get updates, test new comfort flows, and share invite links.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <GlassCard>
          {notice ? (
            <div className="mb-5 rounded-3xl border border-emerald-200/20 bg-emerald-200/[0.08] p-4 text-sm leading-6 text-cream-100/75">
              {notice}
            </div>
          ) : null}

          {referralCode ? (
            <div className="mb-5 rounded-3xl border border-rose-200/20 bg-rose-200/[0.08] p-4 text-sm leading-6 text-cream-100/70">
              You came through an invite: <span className="font-semibold text-cream-100">{referralCode}</span>
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={(event) => void submit(event)}>
            <label className="block text-sm font-semibold text-cream-100/75">
              Email
              <input
                className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="block text-sm font-semibold text-cream-100/75">
              Name
              <input
                className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
                value={name}
                onChange={(event) => setName(event.currentTarget.value)}
                placeholder="Your name"
              />
            </label>

            <label className="block text-sm font-semibold text-cream-100/75">
              Why are you interested?
              <select
                className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-cream-100 outline-none focus:border-rose-200/70"
                value={interest}
                onChange={(event) => setInterest(event.currentTarget.value as WaitlistInterest)}
              >
                {interestOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-cream-100/75">
              What should Dear Her improve first?
              <textarea
                className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
                value={reason}
                onChange={(event) => setReason(event.currentTarget.value)}
                placeholder="Care packages, Mira, soundscapes, mobile app feel..."
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <SoftButton type="submit" disabled={busy}>
                {busy ? "Joining..." : "Join waitlist"}
              </SoftButton>

              <SoftButton type="button" variant="secondary" onClick={() => onNavigate("onboarding")}>
                Try beta first
              </SoftButton>
            </div>
          </form>

          {inviteLink ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.045] p-4">
              <p className="text-sm font-semibold text-cream-100">Your invite link</p>
              <input
                className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-xs text-cream-100/70 outline-none"
                value={inviteLink}
                readOnly
                onFocus={(event) => event.currentTarget.select()}
              />

              <div className="mt-3">
                <SoftButton variant="secondary" onClick={() => void copyInvite()}>
                  Copy invite link
                </SoftButton>
              </div>
            </div>
          ) : null}
        </GlassCard>

        <div className="space-y-5">
          <GlassCard className="border-rose-200/20 bg-rose-200/[0.07]">
            <p className="font-display text-3xl font-semibold text-cream-100">What beta users get</p>

            <div className="mt-5 space-y-3">
              {[
                "Early access to new comfort flows.",
                "Ability to test care packages and Mira.",
                "A direct place to share what felt calming or cringe.",
                "Invite links to bring in trusted testers.",
              ].map((item) => (
                <div key={item} className="rounded-3xl border border-white/10 bg-white/[0.055] p-4 text-sm leading-6 text-cream-100/70">
                  {item}
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <p className="font-display text-3xl font-semibold text-cream-100">Storage status</p>
            <p className="mt-4 text-sm leading-6 text-cream-100/65">
              {isSupabaseConfigured
                ? "Supabase is configured. New waitlist entries will be saved to your beta_waitlist table."
                : "Supabase is not configured locally. Entries will be saved only on this browser until env vars are added."}
            </p>

            <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.045] p-4 text-sm text-cream-100/70">
              Local fallback entries: <span className="font-semibold text-cream-100">{localCount}</span>
            </div>

            <div className="mt-5">
              <SoftButton variant="secondary" onClick={exportLocalWaitlistEntries}>
                Export local fallback
              </SoftButton>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
