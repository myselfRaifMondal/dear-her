import { useMemo, useState } from "react";
import { trackEvent } from "../lib/analytics";
import type { Screen } from "../types/app";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

type YouSpaceProps = {
  onNavigate: (screen: Screen) => void;
};

type YouTab = "overview" | "memories" | "favorites" | "messages" | "privacy" | "sync" | "beta";

type LocalEntry = {
  id: string;
  title: string;
  subtitle: string;
  createdAt?: string;
};

const tabs: Array<{
  id: YouTab;
  label: string;
  description: string;
}> = [
  {
    id: "overview",
    label: "Overview",
    description: "Your comfort snapshot.",
  },
  {
    id: "memories",
    label: "Memories",
    description: "Photos and moments that feel safe.",
  },
  {
    id: "favorites",
    label: "Favorites",
    description: "Tiny things that soften difficult days.",
  },
  {
    id: "messages",
    label: "Messages",
    description: "Words to return to when words are hard.",
  },
  {
    id: "privacy",
    label: "Privacy",
    description: "Export or clear local data.",
  },
  {
    id: "sync",
    label: "Sync",
    description: "Optional cloud backup.",
  },
  {
    id: "beta",
    label: "Beta",
    description: "Feedback, insights, and testing.",
  },
];

const comfortMessages = [
  "You do not have to be okay all at once.",
  "Take the softest possible version of today.",
  "Rest is allowed. You do not need to earn it.",
  "You are not a burden. You are someone worth caring for.",
  "One breath is enough to begin again.",
  "No pressure. No performance. Just a little softness.",
];

function safeParseArray(key: string): unknown[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function firstString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function readLocalEntries(keys: string[], fallbackLabel: string): LocalEntry[] {
  for (const key of keys) {
    const items = safeParseArray(key);

    if (items.length === 0) continue;

    return items.slice(0, 8).map((item, index) => {
      if (typeof item !== "object" || item === null) {
        return {
          id: `${key}-${index}`,
          title: `${fallbackLabel} ${index + 1}`,
          subtitle: String(item),
        };
      }

      const record = item as Record<string, unknown>;

      return {
        id: firstString(record.id, `${key}-${index}`),
        title: firstString(record.title ?? record.name ?? record.caption, `${fallbackLabel} ${index + 1}`),
        subtitle: firstString(record.note ?? record.description ?? record.caption ?? record.text, "Saved in your comfort space."),
        createdAt: firstString(record.createdAt ?? record.created_at, ""),
      };
    });
  }

  return [];
}

function countStoredArray(keys: string[]): number {
  for (const key of keys) {
    const items = safeParseArray(key);
    if (items.length > 0) return items.length;
  }

  return 0;
}

function storageSizeEstimate(): string {
  try {
    let total = 0;

    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (!key) continue;

      const value = window.localStorage.getItem(key) ?? "";
      total += key.length + value.length;
    }

    const kb = Math.round((total * 2) / 1024);

    if (kb < 1024) return `${kb} KB`;

    return `${Math.round((kb / 1024) * 10) / 10} MB`;
  } catch {
    return "Unknown";
  }
}

function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

function exportDearHerLocalData(): void {
  const data: Record<string, unknown> = {};

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key) continue;
    if (!key.startsWith("dear-her")) continue;

    const value = window.localStorage.getItem(key);

    try {
      data[key] = value ? JSON.parse(value) : null;
    } catch {
      data[key] = value;
    }
  }

  downloadJson(`dear-her-you-space-export-${new Date().toISOString().slice(0, 10)}.json`, {
    product: "Dear Her",
    surface: "You Space",
    exportedAt: new Date().toISOString(),
    data,
  });
}

function clearDearHerLocalData(): void {
  const keys: string[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key && key.startsWith("dear-her")) {
      keys.push(key);
    }
  }

  keys.forEach((key) => window.localStorage.removeItem(key));
}

export function YouSpace({ onNavigate }: YouSpaceProps) {
  const [activeTab, setActiveTab] = useState<YouTab>("overview");
  const [notice, setNotice] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const data = useMemo(() => {
    const memories = readLocalEntries(["dear-her-mvp:memory-metadata", "dear-her-mvp:memories"], "Memory");
    const favorites = readLocalEntries(["dear-her-mvp:favorites"], "Favorite");
    const feedback = readLocalEntries(["dear-her-mvp:feedback"], "Feedback");

    return {
      memories,
      favorites,
      feedback,
      stats: {
        memories: countStoredArray(["dear-her-mvp:memory-metadata", "dear-her-mvp:memories"]),
        favorites: countStoredArray(["dear-her-mvp:favorites"]),
        feedback: countStoredArray(["dear-her-mvp:feedback"]),
        miraMessages: countStoredArray(["dear-her-mvp:mira-thread"]),
        localWaitlist: countStoredArray(["dear-her-mvp:local-waitlist"]),
        storage: storageSizeEstimate(),
      },
    };
  }, [refreshToken]);

  function changeTab(tab: YouTab): void {
    setActiveTab(tab);
    trackEvent("you_space_tab_changed", {
      tab,
    });
  }

  function go(screen: Screen, action: string): void {
    trackEvent("you_space_quick_action", {
      action,
      screen,
    });

    onNavigate(screen);
  }

  function exportData(): void {
    exportDearHerLocalData();
    setNotice("Local Dear Her data exported.");
    trackEvent("you_space_export_clicked", {
      surface: "privacy",
    });
  }

  function clearData(): void {
    const confirmed = window.confirm(
      "Clear all local Dear Her data from this browser? This includes memories metadata, favorites, feedback, and settings.",
    );

    if (!confirmed) return;

    clearDearHerLocalData();
    setRefreshToken((value) => value + 1);
    setNotice("Local Dear Her data cleared from this browser.");

    trackEvent("you_space_privacy_action", {
      action: "clear_local_data",
    });
  }

  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-7xl px-5 pb-36 pt-10 sm:px-8">
      <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_0.55fr] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">Your sanctuary</p>
          <h2 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100 sm:text-7xl">
            Keep what helps.
          </h2>
          <p className="mt-5 max-w-3xl leading-7 text-cream-100/70">
            Your personal comfort library for memories, favorites, messages, privacy, sync, and beta testing.
          </p>
        </div>

        <GlassCard className="border-emerald-200/15 bg-emerald-200/[0.06]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100/65">Local-first</p>
          <p className="mt-3 text-sm leading-6 text-cream-100/65">
            Estimated local Dear Her storage: <span className="font-semibold text-cream-100">{data.stats.storage}</span>
          </p>
        </GlassCard>
      </div>

      {notice ? (
        <div className="mb-6 rounded-3xl border border-emerald-200/20 bg-emerald-200/[0.08] p-4 text-sm leading-6 text-cream-100/75">
          {notice}
        </div>
      ) : null}

      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex min-w-max gap-2 rounded-[2rem] border border-white/10 bg-white/[0.035] p-2">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-cream-100 text-slate-950"
                    : "text-cream-100/58 hover:bg-white/[0.07] hover:text-cream-100"
                }`}
                type="button"
                onClick={() => changeTab(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "overview" ? (
        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-3 xl:grid-cols-5">
            <GlassCard className="border-rose-200/20 bg-rose-200/[0.07]">
              <p className="text-sm font-semibold text-cream-100/55">Memories</p>
              <p className="mt-3 font-display text-5xl font-semibold text-cream-100">{data.stats.memories}</p>
            </GlassCard>

            <GlassCard>
              <p className="text-sm font-semibold text-cream-100/55">Favorites</p>
              <p className="mt-3 font-display text-5xl font-semibold text-cream-100">{data.stats.favorites}</p>
            </GlassCard>

            <GlassCard>
              <p className="text-sm font-semibold text-cream-100/55">Mira thread</p>
              <p className="mt-3 font-display text-5xl font-semibold text-cream-100">{data.stats.miraMessages}</p>
            </GlassCard>

            <GlassCard className="border-emerald-200/15 bg-emerald-200/[0.06]">
              <p className="text-sm font-semibold text-cream-100/55">Beta notes</p>
              <p className="mt-3 font-display text-5xl font-semibold text-cream-100">{data.stats.feedback}</p>
            </GlassCard>

            <GlassCard>
              <p className="text-sm font-semibold text-cream-100/55">Waitlist local</p>
              <p className="mt-3 font-display text-5xl font-semibold text-cream-100">{data.stats.localWaitlist}</p>
            </GlassCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
            <GlassCard>
              <p className="font-display text-3xl font-semibold text-cream-100">Your comfort library</p>
              <p className="mt-2 text-sm leading-6 text-cream-100/60">
                Open the deeper pages when you want to add, edit, or restore your comfort items.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 text-left transition hover:bg-white/[0.08]"
                  type="button"
                  onClick={() => go("memories", "open_memories")}
                >
                  <span className="block font-display text-3xl font-semibold text-cream-100">Memories</span>
                  <span className="mt-2 block text-sm leading-6 text-cream-100/60">Save photos and moments that feel comforting.</span>
                </button>

                <button
                  className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 text-left transition hover:bg-white/[0.08]"
                  type="button"
                  onClick={() => go("favorites", "open_favorites")}
                >
                  <span className="block font-display text-3xl font-semibold text-cream-100">Favorites</span>
                  <span className="mt-2 block text-sm leading-6 text-cream-100/60">Keep songs, foods, people, places, and rituals.</span>
                </button>

                <button
                  className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 text-left transition hover:bg-white/[0.08]"
                  type="button"
                  onClick={() => go("messages", "open_messages")}
                >
                  <span className="block font-display text-3xl font-semibold text-cream-100">Messages</span>
                  <span className="mt-2 block text-sm leading-6 text-cream-100/60">Read soft words when your own words feel far away.</span>
                </button>

                <button
                  className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 text-left transition hover:bg-white/[0.08]"
                  type="button"
                  onClick={() => go("sync", "open_sync")}
                >
                  <span className="block font-display text-3xl font-semibold text-cream-100">Sync</span>
                  <span className="mt-2 block text-sm leading-6 text-cream-100/60">Back up your comfort space when you choose.</span>
                </button>
              </div>
            </GlassCard>

            <GlassCard className="h-fit border-rose-200/20 bg-rose-200/[0.07]">
              <p className="font-display text-3xl font-semibold text-cream-100">Your next soft action</p>
              <p className="mt-3 leading-7 text-cream-100/68">
                Pick one tiny thing to keep. A memory, a favorite, a message, or a care package.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <SoftButton onClick={() => go("care", "create_care_package")}>Create a care package</SoftButton>
                <SoftButton variant="secondary" onClick={() => go("mira", "ask_mira")}>
                  Ask Mira what to do first
                </SoftButton>
                <SoftButton variant="secondary" onClick={() => go("room", "open_room")}>
                  Open comfort room
                </SoftButton>
              </div>
            </GlassCard>
          </div>
        </div>
      ) : null}

      {activeTab === "memories" ? (
        <LibraryTab
          title="Memories"
          description="Photos and notes that remind you of softness, safety, or love."
          entries={data.memories}
          emptyTitle="No memories saved yet."
          emptyDescription="Open the full Memories page to add one safe photo or moment."
          actionLabel="Open Memories"
          onAction={() => go("memories", "open_memories_from_tab")}
        />
      ) : null}

      {activeTab === "favorites" ? (
        <LibraryTab
          title="Favorites"
          description="Songs, foods, places, people, textures, and rituals that make hard days softer."
          entries={data.favorites}
          emptyTitle="No favorites saved yet."
          emptyDescription="Open Favorites and add tiny things that help."
          actionLabel="Open Favorites"
          onAction={() => go("favorites", "open_favorites_from_tab")}
        />
      ) : null}

      {activeTab === "messages" ? (
        <GlassCard>
          <p className="font-display text-4xl font-semibold text-cream-100">Comfort messages</p>
          <p className="mt-3 max-w-2xl leading-7 text-cream-100/65">
            Soft words for days when your own words feel far away.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {comfortMessages.map((message) => (
              <div key={message} className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5">
                <p className="text-lg leading-8 text-cream-100/78">“{message}”</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <SoftButton onClick={() => go("messages", "open_messages_from_tab")}>Open full messages</SoftButton>
          </div>
        </GlassCard>
      ) : null}

      {activeTab === "privacy" ? (
        <GlassCard className="border-rose-200/20 bg-rose-200/[0.07]">
          <p className="font-display text-4xl font-semibold text-cream-100">Privacy and local data</p>
          <p className="mt-3 max-w-2xl leading-7 text-cream-100/65">
            Dear Her is local-first. You can export or clear the data saved by this browser.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5">
              <p className="font-semibold text-cream-100">Export</p>
              <p className="mt-2 text-sm leading-6 text-cream-100/60">Download your local Dear Her data as JSON.</p>
              <div className="mt-5">
                <SoftButton onClick={exportData}>Export local data</SoftButton>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5">
              <p className="font-semibold text-cream-100">Cloud sync</p>
              <p className="mt-2 text-sm leading-6 text-cream-100/60">Back up or restore data when Supabase is configured.</p>
              <div className="mt-5">
                <SoftButton variant="secondary" onClick={() => go("sync", "open_sync_from_privacy")}>
                  Open sync
                </SoftButton>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-rose-200/20 bg-rose-200/[0.08] p-5">
              <p className="font-semibold text-cream-100">Clear</p>
              <p className="mt-2 text-sm leading-6 text-cream-100/60">Remove Dear Her data from this browser.</p>
              <div className="mt-5">
                <SoftButton variant="secondary" onClick={clearData}>
                  Clear local data
                </SoftButton>
              </div>
            </div>
          </div>
        </GlassCard>
      ) : null}

      {activeTab === "sync" ? (
        <GlassCard>
          <p className="font-display text-4xl font-semibold text-cream-100">Cloud sync</p>
          <p className="mt-3 max-w-2xl leading-7 text-cream-100/65">
            Sync remains optional. Use it only when you want cloud backup across devices.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5">
              <p className="font-semibold text-cream-100">Save your sanctuary</p>
              <p className="mt-2 text-sm leading-6 text-cream-100/60">
                Memories, favorites, settings, and care data can be backed up when configured.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5">
              <p className="font-semibold text-cream-100">Restore softly</p>
              <p className="mt-2 text-sm leading-6 text-cream-100/60">
                Bring back your comfort space after clearing local data or switching devices.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <SoftButton onClick={() => go("sync", "open_sync_tab")}>Open Cloud Sync</SoftButton>
          </div>
        </GlassCard>
      ) : null}

      {activeTab === "beta" ? (
        <GlassCard className="border-emerald-200/15 bg-emerald-200/[0.06]">
          <p className="font-display text-4xl font-semibold text-cream-100">Beta testing tools</p>
          <p className="mt-3 max-w-2xl leading-7 text-cream-100/65">
            Use these during testing. They should stay hidden from normal users through founder mode.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <BetaAction
              title="Feedback"
              description="Collect comfort ratings and user notes."
              onClick={() => {
                trackEvent("you_space_beta_action", { action: "feedback" });
                onNavigate("feedback");
              }}
            />

            <BetaAction
              title="Insights"
              description="View local analytics and testing signals."
              onClick={() => {
                trackEvent("you_space_beta_action", { action: "insights" });
                onNavigate("insights");
              }}
            />

            <BetaAction
              title="Waitlist"
              description="Open public beta signup and invite capture."
              onClick={() => {
                trackEvent("you_space_beta_action", { action: "waitlist" });
                onNavigate("waitlist");
              }}
            />
          </div>
        </GlassCard>
      ) : null}
    </section>
  );
}

function LibraryTab({
  title,
  description,
  entries,
  emptyTitle,
  emptyDescription,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  entries: LocalEntry[];
  emptyTitle: string;
  emptyDescription: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <GlassCard>
      <p className="font-display text-4xl font-semibold text-cream-100">{title}</p>
      <p className="mt-3 max-w-2xl leading-7 text-cream-100/65">{description}</p>

      <div className="mt-6">
        {entries.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-7">
            <p className="font-display text-3xl font-semibold text-cream-100">{emptyTitle}</p>
            <p className="mt-3 leading-7 text-cream-100/60">{emptyDescription}</p>
            <div className="mt-6">
              <SoftButton onClick={onAction}>{actionLabel}</SoftButton>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {entries.map((entry) => (
              <div key={entry.id} className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5">
                <p className="font-semibold text-cream-100">{entry.title}</p>
                <p className="mt-2 text-sm leading-6 text-cream-100/60">{entry.subtitle}</p>
                {entry.createdAt ? (
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-cream-100/35">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {entries.length > 0 ? (
        <div className="mt-6">
          <SoftButton onClick={onAction}>{actionLabel}</SoftButton>
        </div>
      ) : null}
    </GlassCard>
  );
}

function BetaAction({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 text-left transition hover:bg-white/[0.08]"
      type="button"
      onClick={onClick}
    >
      <span className="block font-display text-3xl font-semibold text-cream-100">{title}</span>
      <span className="mt-2 block text-sm leading-6 text-cream-100/60">{description}</span>
    </button>
  );
}
