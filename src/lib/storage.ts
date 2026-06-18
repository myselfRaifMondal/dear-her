import type { FavoriteThing, Memory, UserSettings } from "../types/app";

const namespace = "dear-her-mvp";

const keys = {
  memories: `${namespace}:memories`,
  favorites: `${namespace}:favorites`,
  settings: `${namespace}:settings`,
  mood: `${namespace}:mood`,
};

type LocalDataExport = {
  product: "Dear Her";
  version: 1;
  exportedAt: string;
  memories: Memory[];
  favorites: FavoriteThing[];
  settings: UserSettings;
  mood: string | null;
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

export function createLocalDataExport(): LocalDataExport {
  return {
    product: "Dear Her",
    version: 1,
    exportedAt: new Date().toISOString(),
    memories: loadMemories(),
    favorites: loadFavorites(),
    settings: loadSettings(),
    mood: loadMood(),
  };
}

export function downloadLocalData(): void {
  const data = createLocalDataExport();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `dear-her-care-package-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.URL.revokeObjectURL(url);
}

export async function importLocalDataFromFile(file: File): Promise<void> {
  const rawText = await file.text();
  const parsed = JSON.parse(rawText) as Partial<LocalDataExport>;

  if (parsed.product !== "Dear Her") {
    throw new Error("This does not look like a Dear Her export file.");
  }

  if (Array.isArray(parsed.memories)) {
    saveMemories(parsed.memories);
  }

  if (Array.isArray(parsed.favorites)) {
    saveFavorites(parsed.favorites);
  }

  if (parsed.settings) {
    saveSettings(parsed.settings);
  }

  if (typeof parsed.mood === "string") {
    saveMood(parsed.mood);
  }
}

export function clearStoredMemories(): void {
  window.localStorage.removeItem(keys.memories);
}

export function clearStoredFavorites(): void {
  window.localStorage.removeItem(keys.favorites);
}

export function clearStoredMood(): void {
  window.localStorage.removeItem(keys.mood);
}

export function clearStoredSettings(): void {
  window.localStorage.removeItem(keys.settings);
}

export function clearAllDearHerData(): void {
  Object.values(keys).forEach((key) => window.localStorage.removeItem(key));
}
