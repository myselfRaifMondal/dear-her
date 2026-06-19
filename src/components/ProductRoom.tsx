import { useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "../lib/analytics";
import { setPendingMiraIntent } from "../lib/miraIntents";
import type { Screen } from "../types/app";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

type ProductRoomProps = {
  onNavigate: (screen: Screen) => void;
};

type RoomMode = "rose" | "moon" | "rain" | "forest" | "ocean";
type RoomSound = "rain" | "forest" | "ocean" | "night" | "fireplace" | "silence";

type RoomConfig = {
  id: RoomMode;
  title: string;
  shortTitle: string;
  description: string;
  whisper: string;
  gradient: string;
  glow: string;
};

type SoundConfig = {
  id: RoomSound;
  title: string;
  description: string;
};

const rooms: RoomConfig[] = [
  {
    id: "rose",
    title: "Rose dusk",
    shortTitle: "Rose",
    description: "Warm, soft, and held.",
    whisper: "Let today become smaller for a while.",
    gradient: "from-rose-200/20 via-fuchsia-200/10 to-transparent",
    glow: "bg-rose-200/20",
  },
  {
    id: "moon",
    title: "Moon quiet",
    shortTitle: "Moon",
    description: "Dark, still, and private.",
    whisper: "No performance. No explaining. Just quiet.",
    gradient: "from-indigo-200/18 via-violet-200/10 to-transparent",
    glow: "bg-violet-200/18",
  },
  {
    id: "rain",
    title: "Rain window",
    shortTitle: "Rain",
    description: "Slow, safe, and reflective.",
    whisper: "Listen to the room breathe with you.",
    gradient: "from-cyan-200/16 via-blue-200/10 to-transparent",
    glow: "bg-cyan-200/16",
  },
  {
    id: "forest",
    title: "Forest blanket",
    shortTitle: "Forest",
    description: "Grounded, natural, and steady.",
    whisper: "Let your body remember the ground.",
    gradient: "from-emerald-200/16 via-green-200/10 to-transparent",
    glow: "bg-emerald-200/16",
  },
  {
    id: "ocean",
    title: "Ocean hush",
    shortTitle: "Ocean",
    description: "Wide, low, and spacious.",
    whisper: "You do not have to hold the whole day.",
    gradient: "from-sky-200/16 via-teal-200/10 to-transparent",
    glow: "bg-sky-200/16",
  },
];

const sounds: SoundConfig[] = [
  {
    id: "rain",
    title: "Rain",
    description: "Soft window rain.",
  },
  {
    id: "forest",
    title: "Forest",
    description: "Leaves and quiet air.",
  },
  {
    id: "ocean",
    title: "Ocean",
    description: "Slow waves.",
  },
  {
    id: "night",
    title: "Night",
    description: "Low room hum.",
  },
  {
    id: "fireplace",
    title: "Fireplace",
    description: "Warm crackle.",
  },
  {
    id: "silence",
    title: "Silence",
    description: "No sound, just space.",
  },
];

const groundingActions = [
  "Lower your shoulders.",
  "Let your jaw unclench.",
  "Take one slower exhale.",
  "Make the room darker.",
  "Place one hand on your chest.",
  "Do nothing for ten seconds.",
];

function createSoftNoise(sound: RoomSound): AudioContext | null {
  if (sound === "silence") return null;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return null;

  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  const frequencyMap: Record<Exclude<RoomSound, "silence">, number> = {
    rain: 174,
    forest: 136,
    ocean: 110,
    night: 98,
    fireplace: 220,
  };

  oscillator.type = sound === "fireplace" ? "triangle" : "sine";
  oscillator.frequency.value = frequencyMap[sound] ?? 136;

  gain.gain.value = 0.018;

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();

  return context;
}

export function ProductRoom({ onNavigate }: ProductRoomProps) {
  const [room, setRoom] = useState<RoomMode>("rose");
  const [selectedSound, setSelectedSound] = useState<RoomSound>("rain");
  const [sessionActive, setSessionActive] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(180);
  const [completedAction, setCompletedAction] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  const activeRoom = useMemo(() => rooms.find((item) => item.id === room) ?? rooms[0], [room]);
  const activeSound = useMemo(() => sounds.find((item) => item.id === selectedSound) ?? sounds[0], [selectedSound]);

  useEffect(() => {
    trackEvent("room_decompression_loaded", {
      room,
      sound: selectedSound,
    });
  }, [room, selectedSound]);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }

      void audioContextRef.current?.close();
    };
  }, []);

  function stopAudio(): void {
    void audioContextRef.current?.close();
    audioContextRef.current = null;
  }

  function startAudio(): void {
    stopAudio();
    audioContextRef.current = createSoftNoise(selectedSound);
  }

  function startSession(): void {
    setSessionActive(true);
    setSecondsRemaining(180);
    startAudio();

    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
          }

          stopAudio();
          setSessionActive(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    trackEvent("room_session_started", {
      room,
      sound: selectedSound,
    });
  }

  function stopSession(): void {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    stopAudio();
    setSessionActive(false);

    trackEvent("room_session_stopped", {
      room,
      sound: selectedSound,
      secondsRemaining,
    });
  }

  function changeRoom(nextRoom: RoomMode): void {
    setRoom(nextRoom);

    trackEvent("room_mood_changed", {
      room: nextRoom,
    });
  }

  function changeSound(nextSound: RoomSound): void {
    setSelectedSound(nextSound);

    if (sessionActive) {
      stopAudio();
      window.setTimeout(() => {
        audioContextRef.current = createSoftNoise(nextSound);
      }, 80);
    }

    trackEvent("room_sound_changed", {
      sound: nextSound,
    });
  }

  function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;

    return `${minutes}:${String(rest).padStart(2, "0")}`;
  }

  function openMira(): void {
    setPendingMiraIntent("soft-plan");

    trackEvent("room_mira_prompt_clicked", {
      room,
      sound: selectedSound,
    });

    onNavigate("mira");
  }

  function completeGroundingAction(action: string): void {
    setCompletedAction(action);

    trackEvent("room_grounding_action_clicked", {
      action,
      room,
    });
  }

  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-6xl px-5 pb-36 pt-10 sm:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">Comfort room</p>
        <h2 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100 sm:text-7xl">
          Set the room around you.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-cream-100/65">
          Choose an atmosphere, start a short room session, and let the interface become quieter.
        </p>
      </div>

      <GlassCard className={`relative mx-auto mt-8 max-w-5xl overflow-hidden border-rose-200/20 bg-gradient-to-br ${activeRoom.gradient} p-7 text-center sm:p-10`}>
        <div className={`absolute -right-24 -top-24 h-72 w-72 rounded-full ${activeRoom.glow} blur-3xl`} />
        <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cream-100/45">
            {activeSound.title} · {sessionActive ? "Session active" : "Ready"}
          </p>

          <h3 className="mt-4 font-display text-6xl font-semibold tracking-[-0.055em] text-cream-100 sm:text-8xl">
            {activeRoom.title}
          </h3>

          <p className="mx-auto mt-4 max-w-2xl text-xl leading-9 text-cream-100/72">
            {activeRoom.whisper}
          </p>

          <div className="mx-auto mt-8 grid h-44 w-44 place-items-center rounded-full border border-white/10 bg-slate-950/25 shadow-[0_0_120px_rgba(255,211,226,0.12)] backdrop-blur-2xl">
            <div>
              <p className="font-display text-5xl font-semibold text-cream-100">{formatTime(secondsRemaining)}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-cream-100/42">
                room time
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {sessionActive ? (
              <SoftButton onClick={stopSession}>Stop session</SoftButton>
            ) : (
              <SoftButton onClick={startSession}>Start 3-minute room</SoftButton>
            )}

            <SoftButton variant="secondary" onClick={() => onNavigate("breathe")}>
              Breathe first
            </SoftButton>

            <SoftButton variant="secondary" onClick={openMira}>
              Ask Mira for a soft plan
            </SoftButton>
          </div>
        </div>
      </GlassCard>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <GlassCard>
          <p className="font-display text-3xl font-semibold text-cream-100">Atmosphere</p>
          <p className="mt-2 text-sm leading-6 text-cream-100/58">Pick the room that matches what you need.</p>

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
                  onClick={() => changeRoom(item.id)}
                >
                  <span className="block font-semibold text-cream-100">{item.shortTitle}</span>
                  <span className="mt-1 block text-xs leading-5 text-cream-100/50">{item.description}</span>
                </button>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard>
          <p className="font-display text-3xl font-semibold text-cream-100">Sound</p>
          <p className="mt-2 text-sm leading-6 text-cream-100/58">
            A subtle generated tone for now. Full real soundscapes still live in the mixer.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {sounds.map((sound) => {
              const active = selectedSound === sound.id;

              return (
                <button
                  key={sound.id}
                  className={`rounded-3xl border p-4 text-left transition ${
                    active
                      ? "border-emerald-200/35 bg-emerald-200/[0.10]"
                      : "border-white/10 bg-white/[0.045] hover:bg-white/[0.075]"
                  }`}
                  type="button"
                  onClick={() => changeSound(sound.id)}
                >
                  <span className="block text-sm font-semibold text-cream-100">{sound.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-cream-100/50">{sound.description}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <a
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.045] px-5 text-sm font-semibold text-cream-100/75 transition hover:bg-white/[0.08] hover:text-cream-100"
              href="/soundscapes"
            >
              Open full sound mixer
            </a>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-6 border-rose-200/20 bg-rose-200/[0.06]">
        <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
          <div>
            <p className="font-display text-3xl font-semibold text-cream-100">Tiny grounding</p>
            <p className="mt-2 text-sm leading-6 text-cream-100/58">
              Choose only one. This is not a checklist.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {groundingActions.map((action) => {
              const active = completedAction === action;

              return (
                <button
                  key={action}
                  className={`rounded-3xl border p-4 text-left text-sm font-semibold transition ${
                    active
                      ? "border-emerald-200/35 bg-emerald-200/[0.10] text-cream-100"
                      : "border-white/10 bg-white/[0.045] text-cream-100/65 hover:bg-white/[0.075]"
                  }`}
                  type="button"
                  onClick={() => completeGroundingAction(action)}
                >
                  {active ? "✓ " : ""}
                  {action}
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>
    </section>
  );
}
