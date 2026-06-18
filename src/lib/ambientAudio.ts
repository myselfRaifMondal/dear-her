import { Howl } from "howler";
import type { EnvironmentId } from "../types/app";

type GeneratedAudioNodes = {
  kind: "generated";
  context: AudioContext;
  master: GainNode;
  nodes: AudioNode[];
  timers: number[];
};

type HowlerAudio = {
  kind: "howler";
  howl: Howl;
  environment: EnvironmentId;
};

type ActiveAmbience = GeneratedAudioNodes | HowlerAudio;

let active: ActiveAmbience | null = null;

const soundSources: Record<EnvironmentId, string> = {
  rain: "/sounds/rain.mp3",
  forest: "/sounds/forest.mp3",
  ocean: "/sounds/ocean.mp3",
  fireplace: "/sounds/fireplace.mp3",
  night: "/sounds/night.mp3",
};

function clampVolume(volume: number): number {
  return Math.max(0, Math.min(volume, 1));
}

function createNoiseBuffer(context: AudioContext, seconds = 2): AudioBuffer {
  const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < data.length; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }

  return buffer;
}

function addFilteredNoise(
  context: AudioContext,
  destination: AudioNode,
  options: { frequency: number; gain: number; type?: BiquadFilterType },
): AudioNode[] {
  const source = context.createBufferSource();
  source.buffer = createNoiseBuffer(context);
  source.loop = true;

  const filter = context.createBiquadFilter();
  filter.type = options.type ?? "lowpass";
  filter.frequency.value = options.frequency;

  const gain = context.createGain();
  gain.gain.value = options.gain;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  source.start();

  return [source, filter, gain];
}

function addTone(
  context: AudioContext,
  destination: AudioNode,
  options: { frequency: number; gain: number; type?: OscillatorType },
): AudioNode[] {
  const oscillator = context.createOscillator();
  oscillator.type = options.type ?? "sine";
  oscillator.frequency.value = options.frequency;

  const gain = context.createGain();
  gain.gain.value = options.gain;

  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start();

  return [oscillator, gain];
}

function addRandomSoftClicks(context: AudioContext, destination: AudioNode): number[] {
  const timers: number[] = [];

  const playClick = (): void => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(420 + Math.random() * 520, context.currentTime);

    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.028, context.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.22);

    oscillator.connect(gain);
    gain.connect(destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.24);

    const timer = window.setTimeout(playClick, 480 + Math.random() * 1450);
    timers.push(timer);
  };

  playClick();

  return timers;
}

function buildGeneratedEnvironment(context: AudioContext, master: GainNode, environment: EnvironmentId): GeneratedAudioNodes {
  const nodes: AudioNode[] = [];
  const timers: number[] = [];

  if (environment === "rain") {
    nodes.push(...addFilteredNoise(context, master, { frequency: 2400, gain: 0.16, type: "bandpass" }));
    nodes.push(...addFilteredNoise(context, master, { frequency: 700, gain: 0.05, type: "lowpass" }));
    timers.push(...addRandomSoftClicks(context, master));
  }

  if (environment === "forest") {
    nodes.push(...addFilteredNoise(context, master, { frequency: 520, gain: 0.08, type: "lowpass" }));
    nodes.push(...addTone(context, master, { frequency: 174, gain: 0.016 }));
    nodes.push(...addTone(context, master, { frequency: 261.63, gain: 0.009 }));
  }

  if (environment === "ocean") {
    nodes.push(...addFilteredNoise(context, master, { frequency: 360, gain: 0.12, type: "lowpass" }));
    nodes.push(...addTone(context, master, { frequency: 110, gain: 0.018 }));
  }

  if (environment === "fireplace") {
    nodes.push(...addFilteredNoise(context, master, { frequency: 1800, gain: 0.08, type: "bandpass" }));
    nodes.push(...addFilteredNoise(context, master, { frequency: 250, gain: 0.04, type: "lowpass" }));
    timers.push(...addRandomSoftClicks(context, master));
  }

  if (environment === "night") {
    nodes.push(...addTone(context, master, { frequency: 136.1, gain: 0.018 }));
    nodes.push(...addTone(context, master, { frequency: 204, gain: 0.01 }));
    nodes.push(...addFilteredNoise(context, master, { frequency: 420, gain: 0.035, type: "lowpass" }));
  }

  return {
    kind: "generated",
    context,
    master,
    nodes,
    timers,
  };
}

async function startGeneratedAmbience(environment: EnvironmentId, volume: number): Promise<void> {
  const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error("Web Audio API is not supported in this browser.");
  }

  const context = new AudioContextClass();
  const master = context.createGain();

  master.gain.value = clampVolume(volume);
  master.connect(context.destination);

  active = buildGeneratedEnvironment(context, master, environment);

  if (context.state === "suspended") {
    await context.resume();
  }
}

async function fallbackToGenerated(environment: EnvironmentId, volume: number, failedHowl: Howl): Promise<void> {
  if (active?.kind === "howler" && active.howl === failedHowl) {
    failedHowl.unload();
    active = null;
    await startGeneratedAmbience(environment, volume);
  }
}

export async function startAmbience(environment: EnvironmentId, volume: number): Promise<void> {
  stopAmbience();

  const safeVolume = clampVolume(volume);
  const source = soundSources[environment];

  const howl = new Howl({
    src: [source],
    loop: true,
    volume: safeVolume,
    html5: false,
    preload: true,
    onloaderror: () => {
      void fallbackToGenerated(environment, safeVolume, howl);
    },
    onplayerror: () => {
      void fallbackToGenerated(environment, safeVolume, howl);
    },
  });

  active = {
    kind: "howler",
    howl,
    environment,
  };

  howl.play();
}

export function setAmbienceVolume(volume: number): void {
  const safeVolume = clampVolume(volume);

  if (!active) return;

  if (active.kind === "howler") {
    active.howl.volume(safeVolume);
    return;
  }

  active.master.gain.setTargetAtTime(safeVolume, active.context.currentTime, 0.1);
}

export function stopAmbience(): void {
  if (!active) return;

  if (active.kind === "howler") {
    active.howl.stop();
    active.howl.unload();
    active = null;
    return;
  }

  active.timers.forEach((timer) => window.clearTimeout(timer));

  active.nodes.forEach((node) => {
    if ("stop" in node && typeof node.stop === "function") {
      try {
        node.stop();
      } catch {
        // Already stopped.
      }
    }

    try {
      node.disconnect();
    } catch {
      // Already disconnected.
    }
  });

  void active.context.close();
  active = null;
}

export function getRequiredSoundFiles(): Record<EnvironmentId, string> {
  return soundSources;
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
