import { useState } from "react";
import { trackEvent } from "../lib/analytics";
import type { Screen } from "../types/app";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

type ProductRoomProps = {
  onNavigate: (screen: Screen) => void;
};

type RoomMode = "rose" | "moon" | "rain" | "forest" | "ocean";

const rooms: Array<{
  id: RoomMode;
  title: string;
  description: string;
  gradient: string;
}> = [
  {
    id: "rose",
    title: "Rose dusk",
    description: "Warm, soft, held.",
    gradient: "from-rose-200/18 via-fuchsia-200/8 to-transparent",
  },
  {
    id: "moon",
    title: "Moon quiet",
    description: "Dark, still, private.",
    gradient: "from-indigo-200/16 via-violet-200/8 to-transparent",
  },
  {
    id: "rain",
    title: "Rain window",
    description: "Slow, safe, reflective.",
    gradient: "from-cyan-200/14 via-blue-200/8 to-transparent",
  },
  {
    id: "forest",
    title: "Forest blanket",
    description: "Grounded, natural, steady.",
    gradient: "from-emerald-200/14 via-green-200/8 to-transparent",
  },
  {
    id: "ocean",
    title: "Ocean hush",
    description: "Wide, low, breathing.",
    gradient: "from-sky-200/14 via-teal-200/8 to-transparent",
  },
];

const sounds = ["Rain", "Forest", "Ocean", "Night", "Fireplace"];

export function ProductRoom({ onNavigate }: ProductRoomProps) {
  const [room, setRoom] = useState<RoomMode>("rose");
  const [selectedSound, setSelectedSound] = useState("Rain");

  const activeRoom = rooms.find((item) => item.id === room) ?? rooms[0];

  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-7xl px-5 pb-36 pt-10 sm:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">Comfort room</p>
        <h2 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100 sm:text-7xl">
          Set the room around you.
        </h2>
        <p className="mt-5 leading-7 text-cream-100/70">
          Choose the atmosphere, pick a soft sound, and take one tiny grounding action.
        </p>
      </div>

      <GlassCard className={`relative overflow-hidden border-rose-200/20 bg-gradient-to-br ${activeRoom.gradient} p-7 sm:p-10`}>
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-rose-200/10 blur-3xl" />

        <div className="relative grid gap-7 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cream-100/50">Current room</p>
            <h3 className="mt-4 font-display text-5xl font-semibold tracking-[-0.04em] text-cream-100 sm:text-7xl">
              {activeRoom.title}
            </h3>
            <p className="mt-4 max-w-xl text-lg leading-8 text-cream-100/70">{activeRoom.description}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <SoftButton onClick={() => onNavigate("breathe")}>Start breathing</SoftButton>
              <SoftButton variant="secondary" onClick={() => onNavigate("mira")}>
                Ask Mira
              </SoftButton>
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.045] px-5 text-sm font-semibold text-cream-100/75 transition hover:bg-white/[0.08] hover:text-cream-100"
                href="/soundscapes"
              >
                Open sound mixer
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/30 p-5 backdrop-blur-2xl">
            <p className="font-display text-3xl font-semibold text-cream-100">Tiny grounding</p>
            <div className="mt-5 space-y-3">
              {[
                "Lower your shoulders.",
                "Let your jaw unclench.",
                "Take one slower exhale.",
                "Make the room darker.",
              ].map((item) => (
                <div key={item} className="rounded-3xl border border-white/10 bg-white/[0.055] p-4 text-sm font-semibold text-cream-100/72">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <GlassCard>
          <p className="font-display text-3xl font-semibold text-cream-100">Choose atmosphere</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-5">
            {rooms.map((item) => {
              const active = item.id === room;

              return (
                <button
                  key={item.id}
                  className={`rounded-[1.5rem] border p-4 text-left transition ${
                    active
                      ? "border-rose-200/50 bg-rose-200/[0.12]"
                      : "border-white/10 bg-white/[0.045] hover:bg-white/[0.075]"
                  }`}
                  type="button"
                  onClick={() => {
                    setRoom(item.id);
                    trackEvent("product_room_environment_changed", {
                      room: item.id,
                    });
                  }}
                >
                  <span className="block font-semibold text-cream-100">{item.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-cream-100/55">{item.description}</span>
                </button>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard>
          <p className="font-display text-3xl font-semibold text-cream-100">Sound layer</p>
          <p className="mt-2 text-sm leading-6 text-cream-100/60">
            Quick sound preference. Use the full mixer for real audio controls.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {sounds.map((sound) => {
              const active = selectedSound === sound;

              return (
                <button
                  key={sound}
                  className={`rounded-3xl border p-4 text-left text-sm font-semibold transition ${
                    active
                      ? "border-emerald-200/35 bg-emerald-200/[0.10] text-cream-100"
                      : "border-white/10 bg-white/[0.045] text-cream-100/65 hover:bg-white/[0.075]"
                  }`}
                  type="button"
                  onClick={() => {
                    setSelectedSound(sound);
                    trackEvent("product_room_sound_selected", {
                      sound,
                    });
                  }}
                >
                  {sound}
                </button>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
