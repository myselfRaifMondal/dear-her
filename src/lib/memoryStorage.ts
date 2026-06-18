import { del, get, keys, set } from "idb-keyval";
import type { Memory } from "../types/app";

type MemoryMetadata = {
  id: string;
  title: string;
  caption: string;
  imageKey: string;
  createdAt: string;
};

const metadataKey = "dear-her-mvp:memory-metadata";
const legacyLocalStorageKey = "dear-her-mvp:memories";
const imageKeyPrefix = "dear-her-mvp:memory-image:";

function readMetadata(): MemoryMetadata[] {
  try {
    const raw = window.localStorage.getItem(metadataKey);
    return raw ? (JSON.parse(raw) as MemoryMetadata[]) : [];
  } catch {
    return [];
  }
}

function writeMetadata(records: MemoryMetadata[]): void {
  window.localStorage.setItem(metadataKey, JSON.stringify(records));
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mime = mimeMatch?.[1] ?? "image/jpeg";
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mime });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read stored image."));
    reader.readAsDataURL(blob);
  });
}

async function readImageAsDataUrl(imageKey: string): Promise<string | null> {
  const value = await get<Blob | string>(imageKey);

  if (!value) return null;

  if (typeof value === "string") {
    return value;
  }

  return blobToDataUrl(value);
}

async function migrateLegacyLocalStorageMemories(): Promise<void> {
  const alreadyMigrated = readMetadata().length > 0;

  if (alreadyMigrated) return;

  const raw = window.localStorage.getItem(legacyLocalStorageKey);

  if (!raw) return;

  try {
    const legacyMemories = JSON.parse(raw) as Memory[];

    if (!Array.isArray(legacyMemories) || legacyMemories.length === 0) return;

    const metadata: MemoryMetadata[] = [];

    for (const memory of legacyMemories) {
      if (!memory.id || !memory.imageDataUrl) continue;

      const imageKey = `${imageKeyPrefix}${memory.id}`;
      await set(imageKey, dataUrlToBlob(memory.imageDataUrl));

      metadata.push({
        id: memory.id,
        title: memory.title,
        caption: memory.caption,
        imageKey,
        createdAt: memory.createdAt,
      });
    }

    writeMetadata(metadata);
    window.localStorage.removeItem(legacyLocalStorageKey);
  } catch {
    // If migration fails, keep the old data untouched.
  }
}

export async function loadMemories(): Promise<Memory[]> {
  await migrateLegacyLocalStorageMemories();

  const records = readMetadata();
  const memories: Memory[] = [];

  for (const record of records) {
    const imageDataUrl = await readImageAsDataUrl(record.imageKey);

    if (!imageDataUrl) continue;

    memories.push({
      id: record.id,
      title: record.title,
      caption: record.caption,
      imageDataUrl,
      createdAt: record.createdAt,
    });
  }

  return memories;
}

export async function addMemory(memory: Memory): Promise<Memory[]> {
  await migrateLegacyLocalStorageMemories();

  const imageKey = `${imageKeyPrefix}${memory.id}`;
  const imageBlob = dataUrlToBlob(memory.imageDataUrl);

  await set(imageKey, imageBlob);

  const existing = readMetadata().filter((item) => item.id !== memory.id);

  writeMetadata([
    {
      id: memory.id,
      title: memory.title,
      caption: memory.caption,
      imageKey,
      createdAt: memory.createdAt,
    },
    ...existing,
  ]);

  return loadMemories();
}

export async function deleteMemory(id: string): Promise<Memory[]> {
  await migrateLegacyLocalStorageMemories();

  const existing = readMetadata();
  const target = existing.find((item) => item.id === id);

  if (target) {
    await del(target.imageKey);
  }

  writeMetadata(existing.filter((item) => item.id !== id));

  return loadMemories();
}

export async function clearMemoryStorage(): Promise<void> {
  const records = readMetadata();

  await Promise.all(records.map((record) => del(record.imageKey)));

  const allKeys = await keys();

  await Promise.all(
    allKeys
      .filter((key) => typeof key === "string" && key.startsWith(imageKeyPrefix))
      .map((key) => del(key)),
  );

  window.localStorage.removeItem(metadataKey);
  window.localStorage.removeItem(legacyLocalStorageKey);
}

export async function exportMemories(): Promise<Memory[]> {
  return loadMemories();
}

export async function importMemories(memories: Memory[]): Promise<void> {
  await clearMemoryStorage();

  for (const memory of memories) {
    if (!memory.id || !memory.imageDataUrl) continue;
    await addMemory(memory);
  }
}
