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

type CareTemplate = {
  id: string;
  title: string;
  description: string;
  tone: CarePackageTone;
  room: CarePackageRoom;
  soundscape: string;
  openingNote: string;
  gentleActions: string[];
  comfortMessages: string[];
};

const templates: CareTemplate[] = [
  {
    id: "hard-day",
    title: "For a hard day",
    description: "Warm, soft, and low-pressure.",
    tone: "warmth",
    room: "rose",
    soundscape: "rain",
    openingNote: "I made this for you because today does not need to be carried alone. Open it slowly. Take only what feels soft.",
    gentleActions: ["Drink something warm", "Try 60 seconds of breathing", "Rest without guilt"],
    comfortMessages: [
      "You do not have to be okay all at once.",
      "Take the softest possible version of today.",
      "You deserve care without explaining yourself.",
    ],
  },
  {
    id: "pain-and-fatigue",
    title: "For pain and tiredness",
    description: "Quiet comfort when the body feels heavy.",
    tone: "quiet",
    room: "moon",
    soundscape: "night",
    openingNote: "I know your body may feel heavy right now. I cannot fix everything, but I wanted to make a softer corner for you.",
    gentleActions: ["Dim the lights", "Hold a pillow close", "Do nothing for five minutes"],
    comfortMessages: [
      "No pressure. No performance. Just a little softness.",
      "Let the day become smaller for a while.",
      "Rest is allowed. You do not need to earn it.",
    ],
  },
  {
    id: "anxious-night",
    title: "For an anxious night",
    description: "Breathing-first and gentle.",
    tone: "breathing",
    room: "rain",
    soundscape: "rain",
    openingNote: "When everything feels loud, start here. One breath, then another. Nothing else needs to be solved right now.",
    gentleActions: ["Try 60 seconds of breathing", "Open a soft soundscape", "Lower your shoulders"],
    comfortMessages: [
      "Inhale slowly. Exhale like you are putting something heavy down.",
      "One breath is enough to begin again.",
      "Stay with this tiny calm moment.",
    ],
  },
  {
    id: "love-note",
    title: "A small love note",
    description: "Affectionate, reassuring, and personal.",
    tone: "love",
    room: "rose",
    soundscape: "fireplace",
    openingNote: "I made this because I love you, and I want you to feel cared for even when I am not beside you.",
    gentleActions: ["Read one comfort message", "Drink something warm", "Rest without guilt"],
    comfortMessages: [
      "You are not a burden. You are someone worth caring for.",
      "I wish I could make this easier, but I am beside you in every way I can be.",
      "You are loved even when you feel low.",
    ],
  },
];

const toneLabels: Record<CarePackageTone, string> = {
  warmth: "Warmth",
  breathing: "Breathing",
  quiet: "Quiet",
  love: "Love",
  sleep: "Sleep",
};

const roomLabels: Record<CarePackageRoom, string> = {
  rose: "Rose dusk",
  moon: "Moon quiet",
  rain: "Rain window",
  forest: "Forest blanket",
  ocean: "Ocean hush",
};

const actionOptions = [
  "Drink something warm",
  "Try 60 seconds of breathing",
  "Dim the lights",
  "Open a soft soundscape",
  "Rest without guilt",
  "Hold a pillow close",
  "Read one comfort message",
  "Do nothing for five minutes",
  "Lower your shoulders",
  "Let your jaw unclench",
];

function createDefaultPackage(): CarePackageData {
  const template = templates[0];

  return {
    version: 1,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    creatorName: "",
    recipientName: "",
    title: template.title,
    openingNote: template.openingNote,
    tone: template.tone,
    room: template.room,
    soundscape: template.soundscape,
    gentleActions: template.gentleActions,
    comfortMessages: template.comfortMessages,
  };
}

function cleanPackage(draft: CarePackageData): CarePackageData {
  return {
    ...draft,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    creatorName: draft.creatorName.trim(),
    recipientName: draft.recipientName.trim(),
    title: draft.title.trim() || "A small comfort package for you",
    openingNote: draft.openingNote.trim() || "I made this for you so the day feels a little softer.",
    gentleActions: draft.gentleActions.map((item) => item.trim()).filter(Boolean).slice(0, 5),
    comfortMessages: draft.comfortMessages.map((item) => item.trim()).filter(Boolean).slice(0, 3),
  };
}

function CarePackageViewer({
  carePackage,
  onNavigate,
}: {
  carePackage: CarePackageData;
  onNavigate: (screen: Screen) => void;
}) {
  useEffect(() => {
    trackEvent("care_package_opened", {
      tone: carePackage.tone,
      room: carePackage.room,
    });
  }, [carePackage.room, carePackage.tone]);

  function viewerAction(action: string, screen: Screen): void {
    trackEvent("care_package_viewer_action_clicked", {
      action,
      screen,
      tone: carePackage.tone,
    });

    onNavigate(screen);
  }

  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-7xl px-5 pb-36 pt-10 sm:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">A soft care package</p>
        <h1 className="mt-5 font-display text-6xl font-semibold tracking-[-0.055em] text-cream-100 sm:text-8xl">
          {carePackage.recipientName ? `For ${carePackage.recipientName}` : "For you"}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-cream-100/65">
          {carePackage.creatorName ? `Made by ${carePackage.creatorName}` : "Made with care"}
          {" · "}
          {toneLabels[carePackage.tone]} · {roomLabels[carePackage.room]}
        </p>
      </div>

      <GlassCard className="mx-auto mt-8 max-w-5xl border-rose-200/20 bg-rose-200/[0.07] p-7 text-center sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-rose-100/70">Open slowly</p>
        <h2 className="mt-4 font-display text-5xl font-semibold tracking-[-0.04em] text-cream-100">
          {carePackage.title}
        </h2>
        <p className="mx-auto mt-6 max-w-3xl whitespace-pre-line text-xl leading-9 text-cream-100/78">
          {carePackage.openingNote}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <SoftButton onClick={() => viewerAction("breathe_now", "breathe")}>Breathe now</SoftButton>
          <SoftButton variant="secondary" onClick={() => viewerAction("open_room", "room")}>
            Open comfort room
          </SoftButton>
          <SoftButton variant="secondary" onClick={() => viewerAction("ask_mira", "mira")}>
            Ask Mira
          </SoftButton>
        </div>
      </GlassCard>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <GlassCard>
          <p className="font-display text-3xl font-semibold text-cream-100">Tiny care steps</p>
          <p className="mt-2 text-sm leading-6 text-cream-100/60">Do one, or do none. This is not a checklist.</p>

          <div className="mt-5 space-y-3">
            {carePackage.gentleActions.map((action) => (
              <div
                key={action}
                className="rounded-3xl border border-white/10 bg-white/[0.055] p-4 text-sm font-semibold text-cream-100/75"
              >
                {action}
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="grid gap-4">
          {carePackage.comfortMessages.map((message) => (
            <GlassCard key={message} className="bg-white/[0.045]">
              <p className="text-xl leading-9 text-cream-100/80">“{message}”</p>
            </GlassCard>
          ))}
        </div>
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
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id);
  const [shareLink, setShareLink] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [recentPackages, setRecentPackages] = useState<CarePackageData[]>(() => loadRecentCarePackages());

  const previewPackage = useMemo(() => cleanPackage(draft), [draft]);
  const selectedTemplateData = useMemo(
    () => templates.find((template) => template.id === selectedTemplate) ?? templates[0],
    [selectedTemplate],
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

  function applyTemplate(template: CareTemplate): void {
    setSelectedTemplate(template.id);
    updateDraft({
      title: template.title,
      openingNote: template.openingNote,
      tone: template.tone,
      room: template.room,
      soundscape: template.soundscape,
      gentleActions: template.gentleActions,
      comfortMessages: template.comfortMessages,
    });

    setNotice(`${template.title} template applied.`);
    trackEvent("care_package_template_selected", {
      template: template.id,
      tone: template.tone,
    });
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

  function refineNote(): void {
    const recipient = draft.recipientName.trim() || "you";
    const creator = draft.creatorName.trim();

    const refined = [
      creator ? `${recipient}, ${creator} made this for you.` : `${recipient}, this was made for you.`,
      "Open it slowly. You do not have to reply, explain, or do anything perfectly.",
      draft.openingNote.trim() || "I just wanted today to feel a little softer for you.",
    ].join("\n\n");

    updateDraft({
      openingNote: refined,
    });

    setNotice("Opening note softened.");
    trackEvent("care_package_note_refined", {
      template: selectedTemplate,
    });
  }

  async function createPackage(): Promise<void> {
    const finalPackage = cleanPackage(draft);
    const link = createCarePackageLink(finalPackage);

    saveRecentCarePackage(finalPackage);
    setRecentPackages(loadRecentCarePackages());
    setShareLink(link);
    setNotice("Care package created. Copy or share the link.");

    trackEvent("care_package_created", {
      tone: finalPackage.tone,
      room: finalPackage.room,
      actions: finalPackage.gentleActions.length,
      template: selectedTemplate,
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

  async function nativeShare(): Promise<void> {
    if (!shareLink) {
      setNotice("Create a care package first.");
      return;
    }

    if (!("share" in window.navigator)) {
      await copyLink();
      return;
    }

    try {
      await window.navigator.share({
        title: draft.title || "A small comfort package",
        text: "I made this soft care package for you.",
        url: shareLink,
      });

      trackEvent("care_package_share_clicked", {
        method: "native",
      });
    } catch {
      setNotice("Share cancelled. You can still copy the link.");
    }
  }

  function togglePreview(): void {
    setPreviewMode((current) => !current);
    trackEvent("care_package_preview_toggled", {
      next: !previewMode,
    });
  }

  if (sharedPackage) {
    return <CarePackageViewer carePackage={sharedPackage} onNavigate={onNavigate} />;
  }

  if (previewMode) {
    return (
      <div>
        <div className="mx-auto flex w-full max-w-7xl justify-end px-5 pt-6 sm:px-8">
          <SoftButton variant="secondary" onClick={togglePreview}>
            Back to builder
          </SoftButton>
        </div>
        <CarePackageViewer carePackage={previewPackage} onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-7xl px-5 pb-36 pt-10 sm:px-8">
      <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_0.62fr] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">Care package</p>
          <h2 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100 sm:text-7xl">
            Make something soft for her.
          </h2>
          <p className="mt-5 max-w-3xl leading-7 text-cream-100/70">
            Choose a template, add your words, preview the recipient experience, and send a private share link.
          </p>
        </div>

        <GlassCard className="border-rose-200/20 bg-rose-200/[0.07]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-100/70">Current template</p>
          <p className="mt-3 font-display text-3xl font-semibold text-cream-100">{selectedTemplateData.title}</p>
          <p className="mt-2 text-sm leading-6 text-cream-100/60">{selectedTemplateData.description}</p>
        </GlassCard>
      </div>

      {notice ? (
        <div className="mb-6 rounded-3xl border border-emerald-200/20 bg-emerald-200/[0.08] p-4 text-sm leading-6 text-cream-100/75">
          {notice}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-5">
          <GlassCard>
            <p className="font-display text-3xl font-semibold text-cream-100">1. Pick the feeling</p>
            <p className="mt-2 text-sm leading-6 text-cream-100/60">
              Start from a template. You can edit everything after.
            </p>

            <div className="mt-5 grid gap-3">
              {templates.map((template) => {
                const active = selectedTemplate === template.id;

                return (
                  <button
                    key={template.id}
                    className={`rounded-[1.75rem] border p-5 text-left transition ${
                      active
                        ? "border-rose-200/50 bg-rose-200/[0.12]"
                        : "border-white/10 bg-white/[0.045] hover:bg-white/[0.075]"
                    }`}
                    type="button"
                    onClick={() => applyTemplate(template)}
                  >
                    <span className="block font-display text-2xl font-semibold text-cream-100">
                      {template.title}
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-cream-100/60">{template.description}</span>
                    <span className="mt-3 inline-flex rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cream-100/45">
                      {toneLabels[template.tone]} · {roomLabels[template.room]}
                    </span>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard>
            <p className="font-display text-3xl font-semibold text-cream-100">2. Tiny care actions</p>
            <p className="mt-2 text-sm leading-6 text-cream-100/60">Select up to five. Keep it kind, not demanding.</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
                    {active ? "✓ " : ""}
                    {action}
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>

        <GlassCard>
          <p className="font-display text-3xl font-semibold text-cream-100">3. Make it personal</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-cream-100/75">
              Your name
              <input
                className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
                value={draft.creatorName}
                onChange={(event) => updateDraft({ creatorName: event.currentTarget.value })}
                placeholder="Your name"
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
              className="mt-2 min-h-40 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
              value={draft.openingNote}
              onChange={(event) => updateDraft({ openingNote: event.currentTarget.value })}
              placeholder="Write something gentle..."
            />
          </label>

          <div className="mt-3">
            <SoftButton variant="secondary" onClick={refineNote}>
              Soften this note
            </SoftButton>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-semibold text-cream-100/75">
              Tone
              <select
                className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-cream-100 outline-none focus:border-rose-200/70"
                value={draft.tone}
                onChange={(event) => updateDraft({ tone: event.currentTarget.value as CarePackageTone })}
              >
                {Object.entries(toneLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-cream-100/75">
              Room
              <select
                className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-cream-100 outline-none focus:border-rose-200/70"
                value={draft.room}
                onChange={(event) => updateDraft({ room: event.currentTarget.value as CarePackageRoom })}
              >
                {Object.entries(roomLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-cream-100/75">
              Sound
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
            <SoftButton variant="secondary" onClick={togglePreview}>
              Preview recipient view
            </SoftButton>
            <SoftButton variant="ghost" onClick={() => setDraft(createDefaultPackage())}>
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
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <SoftButton variant="secondary" onClick={() => void copyLink()}>
                  Copy link
                </SoftButton>
                <SoftButton variant="secondary" onClick={() => void nativeShare()}>
                  Share
                </SoftButton>
              </div>
            </div>
          ) : null}
        </GlassCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.75fr]">
        <GlassCard className="border-rose-200/20 bg-rose-200/[0.07]">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-200/75">Live preview</p>
          <h3 className="mt-3 font-display text-4xl font-semibold text-cream-100">{draft.title}</h3>
          <p className="mt-2 text-sm text-cream-100/55">
            {toneLabels[draft.tone]} · {roomLabels[draft.room]} · {draft.soundscape}
          </p>
          <p className="mt-5 whitespace-pre-line leading-7 text-cream-100/72">{draft.openingNote}</p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
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
              recentPackages.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  className="w-full rounded-3xl border border-white/10 bg-white/[0.045] p-4 text-left transition hover:bg-white/[0.075]"
                  onClick={() => {
                    const link = createCarePackageLink(item);
                    setShareLink(link);
                    setNotice("Recent package loaded. Copy or share the link below.");
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
    </section>
  );
}
