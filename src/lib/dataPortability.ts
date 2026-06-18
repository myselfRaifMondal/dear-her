import { exportMemories, importMemories } from "./memoryStorage";
import {
  loadFavorites,
  loadMood,
  loadSettings,
  saveFavorites,
  saveMood,
  saveSettings,
} from "./storage";
import type { FavoriteThing, Memory, UserSettings } from "../types/app";

type LocalDataExport = {
  product: "Dear Her";
  version: 2;
  exportedAt: string;
  storage: "localStorage+IndexedDB";
  memories: Memory[];
  favorites: FavoriteThing[];
  settings: UserSettings;
  mood: string | null;
};

export async function createLocalDataExport(): Promise<LocalDataExport> {
  return {
    product: "Dear Her",
    version: 2,
    exportedAt: new Date().toISOString(),
    storage: "localStorage+IndexedDB",
    memories: await exportMemories(),
    favorites: loadFavorites(),
    settings: loadSettings(),
    mood: loadMood(),
  };
}

export async function downloadLocalData(): Promise<void> {
  const data = await createLocalDataExport();

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
    await importMemories(parsed.memories);
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
