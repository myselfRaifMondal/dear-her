import { useEffect, useMemo, useState } from "react";
import {
  createCarePackageLink,
  getCarePackageFromCurrentUrl,
  loadRecentCarePackages,
  saveRecentCarePackage,
  type CarePackageData,
  type CarePackageRoom,
  type CarePackageTone,
} from "../lib/carePackage";
import { trackEvent } from "../lib/analytics";
import type { Screen } from "../types/app";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

type CarePackageProps = {
  onNavigate: (screen: Screen) => void;
};

const toneOptions: Array<{ value: CarePackageTone; label: string; description: string }> = [
  {
    value: "warmth",
    label: "Warmth",
    description: "Soft, caring, cozy support.",
  },
  {
    value: "breathing",
    label: "Breathing",
    description: "Gentle grounding and calm.",
  },
  {
    value: "quiet",
    label: "Quiet",
    description: "Low words, low pressure.",
  },
  {
    value: "love",
    label: "Love",
    description: "Affectionate and reassuring.",
  },
  {
    value: "sleep",
    label: "Sleep",
    description: "Rest-first comfort.",
  },
];

const roomOptions: Array<{ value: CarePackageRoom; label: string }> = [
  { value: "rose", label: "Rose dusk" },
  { value: "moon", label: "Moon room" },
  { value: "rain", label: "Rain window" },
  { value: "forest", label: "Forest blanket" },
  { value: "ocean", label: "Ocean hush" },
];

const actionOptions = [
  "Drink something warm",
  "Try 60 seconds of breathing",
  "Dim the lights",
  "Open a soft soundscape",
  "Rest without guilt",
  "Hold a pillow close",
  "Read one comfort message",
  "Do nothing for five minutes",
];

const messageStarters = {
  warmth: [
    "You do not have to be okay all at once.",
    "Take the softest possible version of today.",
    "You deserve care without explaining yourself.",
  ],
  breathing: [
    "Inhale slowly. Exhale like you are putting something heavy down.",
    "One breath is enough to begin again.",
    "Stay with this tiny calm moment.",
  ],
  quiet: [
    "No pressure. No performance. Just a little softness.",
    "You can be quiet and still be deeply cared for.",
    "Let the day become smaller for a while.",
  ],
  love: [
    "You are not a burden. You are someone worth caring for.",
    "I wish I could make this easier, but I am beside you in every way I can be.",
    "You are loved even when you feel low.",
  ],
  sleep: [
    "Rest is allowed. You do not need to earn it.",
    "Let your body take the slower road tonight.",
    "Close the day gently. Nothing more is required from you right now.",
  ],
} satisfies Record<CarePackageTone, string[]>;

function createDefaultPackage(): CarePackageData {
  return {
    version: 1,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    creatorName: "",
    recipientName: "",
    title: "A small comfort package for you",
    openingNote: "I made this for you so the day feels a little softer.",
    tone: "warmth",
    room: "rose",
    soundscape: "rain",
    gentleActions: ["Drink something warm", "Try 60 seconds of breathing", "Rest without guilt"],
    comfortMessages: messageStarters.warmth,
  };
}

function CarePackageViewer({ carePackage, onNavigate }: { carePackage: CarePackageData; onNavigate: (screen: Screen) => void }) {
  useEffect(() => {
    trackEvent("care_package_opened", {
      tone: carePackage.tone,
      room: carePackage.room,
    });
  }, [carePackage.room, carePackage.tone]);

  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-6xl px-5 pb-36 pt-10 sm:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">A care package</p>
        <h2 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100 sm:text-7xl">
          {carePackage.title}
        </h2>
        <p className="mt-5 leading-7 text-cream-100/70">
          {carePackage.creatorName ? `From ${carePackage.creatorName}` : "Made softly for you"}
          {carePackage.recipientName ? ` · for ${carePackage.recipientName}` : ""}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <GlassCard className="border-rose-200/20 bg-rose-200/[0.07]">
          <p className="font-display text-4xl font-semibold text-cream-100">Open this slowly.</p>
          <p className="mt-5 whitespace-pre-line text-lg leading-8 text-cream-100/75">{carePackage.openingNote}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <SoftButton onClick={() => onNavigate("breathe")}>Breathe now</SoftButton>
            <SoftButton variant="secondary" onClick={() => onNavigate("room")}>
              Open room
            </SoftButton>
            <SoftButton variant="secondary" onClick={() => onNavigate("sounds")}>
              Play sound
            </SoftButton>
          </div>
        </GlassCard>

        <GlassCard>
          <p className="font-display text-3xl font-semibold text-cream-100">Tiny care steps</p>
          <div className="mt-5 space-y-3">
            {carePackage.gentleActions.map((action) => (
              <div key={action} className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 text-sm font-semibold text-cream-100/75">
                {action}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {carePackage.comfortMessages.map((message) => (
          <GlassCard key={message} className="bg-white/[0.045]">
            <p className="text-lg leading-8 text-cream-100/78">“{message}”</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="mt-6 border-white/10 bg-white/[0.04]">
        <p className="text-sm leading-6 text-cream-100/60">
          Dear Her is a comfort space, not medical care. For severe, unusual, or frightening symptoms, please contact a qualified medical professional or local emergency service.
        </p>
      </GlassCard>
    </section>
  );
}

export function CarePackage({ onNavigate }: CarePackageProps) {
  const [sharedPackage, setSharedPackage] = useState<CarePackageData | null>(() => getCarePackageFromCurrentUrl());
  const [draft, setDraft] = useState<CarePackageData>(() => createDefaultPackage());
  const [shareLink, setShareLink] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [recentPackages, setRecentPackages] = useState<CarePackageData[]>(() => loadRecentCarePackages());

  const selectedTone = useMemo(
    () => toneOptions.find((tone) => tone.value === draft.tone) ?? toneOptions[0],
    [draft.tone],
  );

  useEffect(() => {
    const handleHashChange = (): void => {
      setSharedPackage(getCarePackageFromCurrentUrl());
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function updateDraft(patch: Partial<CarePackageData>): void {
    setDraft((current) => ({
      ...current,
      ...patch,
    }));
  }

  function toggleAction(action: string): void {
    setDraft((current) => {
      const exists = current.gentleActions.includes(action);
      const gentleActions = exists
        ? current.gentleActions.filter((item) => item !== action)
        : [...current.gentleActions, action].slice(0, 5);

      return {
        ...current,
        gentleActions,
      };
    });
  }

  function updateMessage(index: number, value: string): void {
    setDraft((current) => ({
      ...current,
      comfortMessages: current.comfortMessages.map((message, messageIndex) =>
        messageIndex === index ? value : message,
      ),
    }));
  }

  function useToneTemplate(tone: CarePackageTone): void {
    updateDraft({
      tone,
      comfortMessages: messageStarters[tone],
    });
  }

  async function createPackage(): Promise<void> {
    const cleanPackage: CarePackageData = {
      ...draft,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      creatorName: draft.creatorName.trim(),
      recipientName: draft.recipientName.trim(),
      title: draft.title.trim() || "A small comfort package for you",
      openingNote: draft.openingNote.trim() || "I made this for you so the day feels a little softer.",
      gentleActions: draft.gentleActions.length > 0 ? draft.gentleActions : ["Rest without guilt"],
      comfortMessages: draft.comfortMessages.map((message) => message.trim()).filter(Boolean).slice(0, 3),
    };

    const link = createCarePackageLink(cleanPackage);

    saveRecentCarePackage(cleanPackage);
    setRecentPackages(loadRecentCarePackages());
    setShareLink(link);
    setNotice("Care package created. Copy the link and send it to her.");

    trackEvent("care_package_created", {
      tone: cleanPackage.tone,
      room: cleanPackage.room,
      actions: cleanPackage.gentleActions.length,
    });

    try {
      await window.navigator.clipboard.writeText(link);
      setNotice("Care package created and copied to clipboard.");
      trackEvent("care_package_copied", {
        method: "auto",
      });
    } catch {
      setNotice("Care package created. Copy the link manually below.");
    }
  }

  async function copyLink(): Promise<void> {
    if (!shareLink) return;

    try {
      await window.navigator.clipboard.writeText(shareLink);
      setNotice("Care package link copied.");
      trackEvent("care_package_copied", {
        method: "manual",
      });
    } catch {
      setNotice("Could not copy automatically. Select and copy the link manually.");
    }
  }

  if (sharedPackage) {
    return <CarePackageViewer carePackage={sharedPackage} onNavigate={onNavigate} />;
  }

  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-7xl px-5 pb-36 pt-10 sm:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">Care package</p>
        <h2 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100 sm:text-7xl">
          Make something soft for her.
        </h2>
        <p className="mt-5 leading-7 text-cream-100/70">
          Create a private shareable comfort link with a note, soft actions, and reassuring messages. No login required.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassCard>
          {notice ? (
            <div className="mb-5 rounded-3xl border border-emerald-200/20 bg-emerald-200/[0.08] p-4 text-sm leading-6 text-cream-100/75">
              {notice}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-cream-100/75">
              Your name
              <input
                className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
                value={draft.creatorName}
                onChange={(event) => updateDraft({ creatorName: event.currentTarget.value })}
                placeholder="Soumyadeep"
              />
            </label>

            <label className="block text-sm font-semibold text-cream-100/75">
              Her name
              <input
                className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
                value={draft.recipientName}
                onChange={(event) => updateDraft({ recipientName: event.currentTarget.value })}
                placeholder="Her name"
              />
            </label>
          </div>

          <label className="mt-5 block text-sm font-semibold text-cream-100/75">
            Package title
            <input
              className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
              value={draft.title}
              onChange={(event) => updateDraft({ title: event.currentTarget.value })}
              placeholder="A small comfort package for you"
            />
          </label>

          <label className="mt-5 block text-sm font-semibold text-cream-100/75">
            Opening note
            <textarea
              className="mt-2 min-h-32 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
              value={draft.openingNote}
              onChange={(event) => updateDraft({ openingNote: event.currentTarget.value })}
              placeholder="Write something gentle..."
            />
          </label>

          <div className="mt-5">
            <p className="text-sm font-semibold text-cream-100/75">Comfort tone</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-5">
              {toneOptions.map((tone) => (
                <button
                  key={tone.value}
                  className={`rounded-3xl border p-4 text-left transition ${
                    draft.tone === tone.value
                      ? "border-rose-200/50 bg-rose-200/[0.12]"
                      : "border-white/10 bg-white/[0.045] hover:bg-white/[0.075]"
                  }`}
                  onClick={() => useToneTemplate(tone.value)}
                  type="button"
                >
                  <span className="block text-sm font-semibold text-cream-100">{tone.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-cream-100/55">{tone.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-cream-100/75">
              Room mood
              <select
                className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-cream-100 outline-none focus:border-rose-200/70"
                value={draft.room}
                onChange={(event) => updateDraft({ room: event.currentTarget.value as CarePackageRoom })}
              >
                {roomOptions.map((room) => (
                  <option key={room.value} value={room.value}>
                    {room.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-cream-100/75">
              Suggested sound
              <select
                className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-cream-100 outline-none focus:border-rose-200/70"
                value={draft.soundscape}
                onChange={(event) => updateDraft({ soundscape: event.currentTarget.value })}
              >
                <option value="rain">Rain</option>
                <option value="forest">Forest</option>
                <option value="ocean">Ocean</option>
                <option value="night">Night</option>
                <option value="fireplace">Fireplace</option>
              </select>
            </label>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-cream-100/75">Tiny actions</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {actionOptions.map((action) => {
                const active = draft.gentleActions.includes(action);

                return (
                  <button
                    key={action}
                    className={`rounded-3xl border p-4 text-left text-sm font-semibold transition ${
                      active
                        ? "border-emerald-200/30 bg-emerald-200/[0.10] text-cream-100"
                        : "border-white/10 bg-white/[0.045] text-cream-100/65 hover:bg-white/[0.075]"
                    }`}
                    onClick={() => toggleAction(action)}
                    type="button"
                  >
                    {action}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-sm font-semibold text-cream-100/75">Comfort messages</p>
            {draft.comfortMessages.map((message, index) => (
              <textarea
                key={index}
                className="min-h-20 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
                value={message}
                onChange={(event) => updateMessage(index, event.currentTarget.value)}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <SoftButton onClick={() => void createPackage()}>Create share link</SoftButton>
            <SoftButton variant="secondary" onClick={() => setDraft(createDefaultPackage())}>
              Reset
            </SoftButton>
          </div>

          {shareLink ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.045] p-4">
              <p className="text-sm font-semibold text-cream-100">Share link</p>
              <input
                className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-xs text-cream-100/70 outline-none"
                value={shareLink}
                readOnly
                onFocus={(event) => event.currentTarget.select()}
              />
              <div className="mt-3">
                <SoftButton variant="secondary" onClick={() => void copyLink()}>
                  Copy link
                </SoftButton>
              </div>
            </div>
          ) : null}
        </GlassCard>

        <div className="space-y-5">
          <GlassCard className="border-rose-200/20 bg-rose-200/[0.07]">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-200/75">Preview</p>
            <h3 className="mt-3 font-display text-4xl font-semibold text-cream-100">{draft.title}</h3>
            <p className="mt-2 text-sm text-cream-100/55">
              {selectedTone.label} · {draft.room} · {draft.soundscape}
            </p>
            <p className="mt-5 whitespace-pre-line leading-7 text-cream-100/72">{draft.openingNote}</p>

            <div className="mt-5 space-y-2">
              {draft.comfortMessages.map((message) => (
                <div key={message} className="rounded-3xl border border-white/10 bg-white/[0.05] p-4 text-sm leading-6 text-cream-100/72">
                  “{message}”
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <p className="font-display text-3xl font-semibold text-cream-100">Recent packages</p>
            <div className="mt-5 space-y-3">
              {recentPackages.length === 0 ? (
                <p className="text-sm leading-6 text-cream-100/60">No care packages created on this browser yet.</p>
              ) : (
                recentPackages.map((item) => (
                  <button
                    key={item.id}
                    className="w-full rounded-3xl border border-white/10 bg-white/[0.045] p-4 text-left transition hover:bg-white/[0.075]"
                    onClick={() => {
                      const link = createCarePackageLink(item);
                      setShareLink(link);
                      setNotice("Recent package loaded. Copy the link below.");
                    }}
                    type="button"
                  >
                    <span className="block font-semibold text-cream-100">{item.title}</span>
                    <span className="mt-1 block text-xs text-cream-100/50">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </button>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
