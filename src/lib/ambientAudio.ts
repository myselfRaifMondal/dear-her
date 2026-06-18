import type { EnvironmentId } from "../types/app";

type AudioNodes = {
  context: AudioContext;
  master: GainNode;
  nodes: AudioNode[];
  timers: number[];
};

let active: AudioNodes | null = null;

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

function addRandomDroplets(context: AudioContext, destination: AudioNode): number[] {
  const timers: number[] = [];

  const playDrop = (): void => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(620 + Math.random() * 400, context.currentTime);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.045, context.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.22);
    oscillator.connect(gain);
    gain.connect(destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.24);

    const timer = window.setTimeout(playDrop, 380 + Math.random() * 1200);
    timers.push(timer);
  };

  playDrop();
  return timers;
}

function buildEnvironment(context: AudioContext, master: GainNode, environment: EnvironmentId): AudioNodes {
  const nodes: AudioNode[] = [];
  const timers: number[] = [];

  if (environment === "rain") {
    nodes.push(...addFilteredNoise(context, master, { frequency: 2400, gain: 0.16, type: "bandpass" }));
    nodes.push(...addFilteredNoise(context, master, { frequency: 700, gain: 0.05, type: "lowpass" }));
    timers.push(...addRandomDroplets(context, master));
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
    timers.push(...addRandomDroplets(context, master));
  }

  if (environment === "night") {
    nodes.push(...addTone(context, master, { frequency: 136.1, gain: 0.018 }));
    nodes.push(...addTone(context, master, { frequency: 204, gain: 0.01 }));
    nodes.push(...addFilteredNoise(context, master, { frequency: 420, gain: 0.035, type: "lowpass" }));
  }

  return { context, master, nodes, timers };
}

export async function startAmbience(environment: EnvironmentId, volume: number): Promise<void> {
  stopAmbience();
  const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error("Web Audio API is not supported in this browser.");
  }
  const context = new AudioContextClass();
  const master = context.createGain();
  master.gain.value = Math.max(0, Math.min(volume, 1));
  master.connect(context.destination);
  active = buildEnvironment(context, master, environment);

  if (context.state === "suspended") {
    await context.resume();
  }
}

export function setAmbienceVolume(volume: number): void {
  if (!active) return;
  active.master.gain.setTargetAtTime(Math.max(0, Math.min(volume, 1)), active.context.currentTime, 0.1);
}

export function stopAmbience(): void {
  if (!active) return;
  active.timers.forEach((timer) => window.clearTimeout(timer));
  active.nodes.forEach((node) => {
    if ("stop" in node && typeof node.stop === "function") {
      try {
        node.stop();
      } catch {
        // The node may already be stopped. This is safe to ignore.
      }
    }
    node.disconnect();
  });
  void active.context.close();
  active = null;
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
