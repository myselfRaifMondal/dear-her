import { useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "../lib/analytics";
import { setPendingMiraIntent } from "../lib/miraIntents";
import type { Mood, Screen } from "../types/app";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

type BreathingSpaceProps = {
  selectedMood?: Mood | null;
  onNavigate?: (screen: Screen) => void;

  // Backward-compatible props used by older App.tsx route wiring
  reducedMotion?: boolean;
  onOpenRoom?: () => void;
};

type BreathPatternId = "soft" | "steady" | "release" | "sleep";
type BreathPhase = "inhale" | "hold" | "exhale" | "rest";

type BreathSegment = {
  phase: BreathPhase;
  seconds: number;
  label: string;
};

type BreathPattern = {
  id: BreathPatternId;
  title: string;
  description: string;
  segments: BreathSegment[];
};

const patterns: BreathPattern[] = [
  {
    id: "soft",
    title: "Soft breath",
    description: "Simple and gentle. Good when you do not want to think.",
    segments: [
      { phase: "inhale", seconds: 4, label: "Inhale softly" },
      { phase: "exhale", seconds: 6, label: "Exhale slowly" },
    ],
  },
  {
    id: "steady",
    title: "Steady breath",
    description: "Balanced rhythm for feeling more settled.",
    segments: [
      { phase: "inhale", seconds: 4, label: "Inhale" },
      { phase: "hold", seconds: 2, label: "Hold gently" },
      { phase: "exhale", seconds: 4, label: "Exhale" },
      { phase: "rest", seconds: 2, label: "Rest" },
    ],
  },
  {
    id: "release",
    title: "Release breath",
    description: "Longer exhales for putting something heavy down.",
    segments: [
      { phase: "inhale", seconds: 3, label: "Take air in" },
      { phase: "exhale", seconds: 7, label: "Let it leave" },
    ],
  },
  {
    id: "sleep",
    title: "Sleepy breath",
    description: "Slow and low for winding down.",
    segments: [
      { phase: "inhale", seconds: 4, label: "Inhale slowly" },
      { phase: "hold", seconds: 3, label: "Stay soft" },
      { phase: "exhale", seconds: 7, label: "Exhale fully" },
    ],
  },
];

const durations = [
  { seconds: 60, label: "1 min" },
  { seconds: 120, label: "2 min" },
  { seconds: 180, label: "3 min" },
];

const phaseCopy: Record<BreathPhase, string> = {
  inhale: "Let the air come in.",
  hold: "Stay gentle. No force.",
  exhale: "Let something heavy leave.",
  rest: "Rest in the quiet.",
};

function getCycleLength(pattern: BreathPattern): number {
  return pattern.segments.reduce((total, segment) => total + segment.seconds, 0);
}

function getCurrentSegment(pattern: BreathPattern, elapsed: number): BreathSegment {
  const cycleLength = getCycleLength(pattern);
  const position = elapsed % cycleLength;

  let cursor = 0;

  for (const segment of pattern.segments) {
    cursor += segment.seconds;

    if (position < cursor) {
      return segment;
    }
  }

  return pattern.segments[0];
}

function getPhaseProgress(pattern: BreathPattern, elapsed: number): number {
  const cycleLength = getCycleLength(pattern);
  const position = elapsed % cycleLength;

  let cursor = 0;

  for (const segment of pattern.segments) {
    const start = cursor;
    const end = cursor + segment.seconds;

    if (position >= start && position < end) {
      return Math.round(((position - start) / segment.seconds) * 100);
    }

    cursor = end;
  }

  return 0;
}

export function BreathingSpace({
  selectedMood = null,
  onNavigate,
  reducedMotion = false,
  onOpenRoom,
}: BreathingSpaceProps) {
  const [patternId, setPatternId] = useState<BreathPatternId>("soft");
  const [duration, setDuration] = useState(60);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const pattern = useMemo(
    () => patterns.find((item) => item.id === patternId) ?? patterns[0],
    [patternId],
  );

  const currentSegment = useMemo(() => getCurrentSegment(pattern, elapsed), [pattern, elapsed]);
  const phaseProgress = useMemo(() => getPhaseProgress(pattern, elapsed), [pattern, elapsed]);
  const remaining = Math.max(duration - elapsed, 0);
  const totalProgress = Math.round((elapsed / duration) * 100);

  useEffect(() => {
    trackEvent("breathe_decompression_loaded", {
      pattern: patternId,
      duration,
      mood: selectedMood ?? "unknown",
    });
  }, [duration, patternId, selectedMood]);

  useEffect(() => {
    if (!running) return;

    intervalRef.current = window.setInterval(() => {
      setElapsed((current) => {
        const next = current + 1;

        if (next >= duration) {
          window.clearInterval(intervalRef.current ?? undefined);
          intervalRef.current = null;
          setRunning(false);
          setCompleted(true);

          trackEvent("breathe_session_completed", {
            pattern: patternId,
            duration,
          });

          return duration;
        }

        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [duration, patternId, running]);

  function startSession(): void {
    if (elapsed >= duration) {
      setElapsed(0);
      setCompleted(false);
    }

    setRunning(true);

    trackEvent("breathe_session_started", {
      pattern: patternId,
      duration,
      mood: selectedMood ?? "unknown",
    });
  }

  function pauseSession(): void {
    setRunning(false);

    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    trackEvent("breathe_session_paused", {
      pattern: patternId,
      elapsed,
      duration,
    });
  }

  function resetSession(): void {
    setRunning(false);
    setElapsed(0);
    setCompleted(false);

    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function changePattern(nextPattern: BreathPatternId): void {
    setPatternId(nextPattern);
    resetSession();

    trackEvent("breathe_pattern_changed", {
      pattern: nextPattern,
    });
  }

  function changeDuration(nextDuration: number): void {
    setDuration(nextDuration);
    resetSession();

    trackEvent("breathe_duration_changed", {
      duration: nextDuration,
    });
  }

  function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;

    return `${minutes}:${String(rest).padStart(2, "0")}`;
  }

  function aftercare(screen: Screen, action: string): void {
    trackEvent("breathe_aftercare_clicked", {
      action,
      screen,
    });

    if (screen === "mira") {
      setPendingMiraIntent("soft-plan");
    }

    if (screen === "room" && onOpenRoom) {
      onOpenRoom();
      return;
    }

    onNavigate?.(screen);
  }

  const orbScale = reducedMotion
    ? "scale-100"
    : currentSegment.phase === "inhale"
      ? "scale-110"
      : currentSegment.phase === "hold"
        ? "scale-110"
        : currentSegment.phase === "exhale"
          ? "scale-90"
          : "scale-95";

  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-6xl px-5 pb-36 pt-10 sm:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">Breathe</p>
        <h2 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100 sm:text-7xl">
          One breath is enough to begin.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-cream-100/65">
          A quiet breathing session for when the day feels too loud. No pressure to finish.
        </p>
      </div>

      <GlassCard className="mx-auto mt-8 max-w-5xl overflow-hidden border-rose-200/20 bg-rose-200/[0.06] p-7 text-center sm:p-10">
        <div className="mx-auto grid h-72 w-72 place-items-center rounded-full border border-white/10 bg-slate-950/25 shadow-[0_0_130px_rgba(255,211,226,0.12)] sm:h-96 sm:w-96">
          <div
            className={`grid h-44 w-44 place-items-center rounded-full border border-rose-200/20 bg-rose-200/[0.10] shadow-[0_0_90px_rgba(255,211,226,0.18)] transition-transform duration-[2400ms] ease-in-out sm:h-60 sm:w-60 ${orbScale}`}
          >
            <div>
              <p className="font-display text-4xl font-semibold text-cream-100 sm:text-5xl">
                {currentSegment.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-cream-100/55">{phaseCopy[currentSegment.phase]}</p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-xl">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-cream-100/45">
            <span>{formatTime(elapsed)}</span>
            <span>{formatTime(remaining)} left</span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-cream-100 transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            />
          </div>

          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className="h-full rounded-full bg-rose-200/70 transition-all duration-500"
              style={{ width: `${phaseProgress}%` }}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {running ? (
            <SoftButton onClick={pauseSession}>Pause</SoftButton>
          ) : (
            <SoftButton onClick={startSession}>{elapsed > 0 && !completed ? "Continue" : "Start breathing"}</SoftButton>
          )}

          <SoftButton variant="secondary" onClick={resetSession}>
            Reset
          </SoftButton>

          <SoftButton variant="secondary" onClick={() => aftercare("room", "open_room")}>
            Open room after
          </SoftButton>
        </div>

        {completed ? (
          <div className="mx-auto mt-7 max-w-2xl rounded-3xl border border-emerald-200/20 bg-emerald-200/[0.08] p-5 text-sm leading-6 text-cream-100/75">
            You completed this breathing session. Take one softer next step, or simply stop here.
          </div>
        ) : null}
      </GlassCard>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <GlassCard>
          <p className="font-display text-3xl font-semibold text-cream-100">Breathing rhythm</p>
          <p className="mt-2 text-sm leading-6 text-cream-100/58">Choose what feels least demanding.</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {patterns.map((item) => {
              const active = item.id === patternId;

              return (
                <button
                  key={item.id}
                  className={`rounded-[1.5rem] border p-4 text-left transition ${
                    active
                      ? "border-rose-200/50 bg-rose-200/[0.12]"
                      : "border-white/10 bg-white/[0.045] hover:bg-white/[0.075]"
                  }`}
                  type="button"
                  onClick={() => changePattern(item.id)}
                >
                  <span className="block font-semibold text-cream-100">{item.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-cream-100/50">{item.description}</span>
                </button>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard>
          <p className="font-display text-3xl font-semibold text-cream-100">Session length</p>
          <p className="mt-2 text-sm leading-6 text-cream-100/58">Short is enough. Stopping early is allowed.</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {durations.map((item) => {
              const active = duration === item.seconds;

              return (
                <button
                  key={item.seconds}
                  className={`rounded-[1.5rem] border p-4 text-center font-semibold transition ${
                    active
                      ? "border-emerald-200/35 bg-emerald-200/[0.10] text-cream-100"
                      : "border-white/10 bg-white/[0.045] text-cream-100/65 hover:bg-white/[0.075]"
                  }`}
                  type="button"
                  onClick={() => changeDuration(item.seconds)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.045] p-4 text-sm leading-6 text-cream-100/60">
            Current rhythm: <span className="font-semibold text-cream-100">{pattern.title}</span>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-6 border-rose-200/20 bg-rose-200/[0.06]">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="font-display text-3xl font-semibold text-cream-100">After breathing</p>
            <p className="mt-2 text-sm leading-6 text-cream-100/58">
              Choose one soft follow-up. Or choose nothing.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <SoftButton variant="secondary" onClick={() => aftercare("room", "open_room")}>
              Open room
            </SoftButton>
            <SoftButton variant="secondary" onClick={() => aftercare("mira", "ask_mira")}>
              Ask Mira
            </SoftButton>
            <SoftButton variant="secondary" onClick={() => aftercare("you", "open_you")}>
              Save what helps
            </SoftButton>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}
