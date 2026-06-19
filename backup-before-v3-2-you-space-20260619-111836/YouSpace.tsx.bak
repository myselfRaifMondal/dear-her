import { useMemo } from "react";
import { trackEvent } from "../lib/analytics";
import type { Screen } from "../types/app";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

type YouSpaceProps = {
  onNavigate: (screen: Screen) => void;
};

function countStoredArray(keys: string[]): number {
  for (const key of keys) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) return parsed.length;
    } catch {
      continue;
    }
  }

  return 0;
}

export function YouSpace({ onNavigate }: YouSpaceProps) {
  const stats = useMemo(
    () => ({
      memories: countStoredArray(["dear-her-mvp:memory-metadata", "dear-her-mvp:memories"]),
      favorites: countStoredArray(["dear-her-mvp:favorites"]),
      feedback: countStoredArray(["dear-her-mvp:feedback"]),
    }),
    [],
  );

  function go(screen: Screen, action: string): void {
    trackEvent("you_space_action_clicked", {
      action,
      screen,
    });

    onNavigate(screen);
  }

  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-7xl px-5 pb-36 pt-10 sm:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">Your sanctuary</p>
        <h2 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100 sm:text-7xl">
          Keep what helps.
        </h2>
        <p className="mt-5 leading-7 text-cream-100/70">
          Your personal comfort space for memories, favorite things, saved messages, privacy, and sync.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <GlassCard className="border-rose-200/20 bg-rose-200/[0.07]">
          <p className="text-sm font-semibold text-cream-100/55">Memories</p>
          <p className="mt-3 font-display text-5xl font-semibold text-cream-100">{stats.memories}</p>
          <p className="mt-2 text-sm leading-6 text-cream-100/60">Photos and notes that feel safe.</p>
        </GlassCard>

        <GlassCard>
          <p className="text-sm font-semibold text-cream-100/55">Favorites</p>
          <p className="mt-3 font-display text-5xl font-semibold text-cream-100">{stats.favorites}</p>
          <p className="mt-2 text-sm leading-6 text-cream-100/60">Tiny things that make a day softer.</p>
        </GlassCard>

        <GlassCard className="border-emerald-200/15 bg-emerald-200/[0.06]">
          <p className="text-sm font-semibold text-cream-100/55">Beta notes</p>
          <p className="mt-3 font-display text-5xl font-semibold text-cream-100">{stats.feedback}</p>
          <p className="mt-2 text-sm leading-6 text-cream-100/60">Founder testing feedback saved locally.</p>
        </GlassCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <GlassCard>
          <p className="font-display text-3xl font-semibold text-cream-100">Your comfort library</p>
          <p className="mt-2 text-sm leading-6 text-cream-100/60">
            This is where the app becomes yours — memories, messages, favorites, and the things that actually help.
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

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.055] p-4 text-sm leading-6 text-cream-100/60">
            Privacy note: Dear Her stays local-first unless you intentionally enable cloud sync.
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
