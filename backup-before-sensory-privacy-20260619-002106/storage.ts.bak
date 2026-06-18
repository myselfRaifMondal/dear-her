import type { FavoriteThing, Memory, UserSettings } from "../types/app";

const namespace = "dear-her-mvp";

const keys = {
  memories: `${namespace}:memories`,
  favorites: `${namespace}:favorites`,
  settings: `${namespace}:settings`,
  mood: `${namespace}:mood`,
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadMemories(): Memory[] {
  return readJson<Memory[]>(keys.memories, []);
}

export function saveMemories(memories: Memory[]): void {
  writeJson(keys.memories, memories);
}

export function loadFavorites(): FavoriteThing[] {
  return readJson<FavoriteThing[]>(keys.favorites, []);
}

export function saveFavorites(favorites: FavoriteThing[]): void {
  writeJson(keys.favorites, favorites);
}

export function loadSettings(): UserSettings {
  return readJson<UserSettings>(keys.settings, {
    reducedMotion: false,
    reducedTransparency: false,
    ambienceVolume: 0.35,
  });
}

export function saveSettings(settings: UserSettings): void {
  writeJson(keys.settings, settings);
}

export function loadMood(): string | null {
  return window.localStorage.getItem(keys.mood);
}

export function saveMood(mood: string): void {
  window.localStorage.setItem(keys.mood, mood);
}
