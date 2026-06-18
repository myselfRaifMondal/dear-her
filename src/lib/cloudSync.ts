import type { SupabaseClient, User } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

export type CloudCarePackage = {
  data: unknown;
  updatedAt: string;
};

type JsonRecord = Record<string, unknown>;

type CloudMemoryRecord = JsonRecord & {
  id?: unknown;
  imageDataUrl?: unknown;
  imageStoragePath?: unknown;
  imageContentType?: unknown;
};

const memoryPhotosBucket = "memory-photos";

function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error("Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getDataUrlMime(dataUrl: string): string {
  const match = dataUrl.match(/^data:(.*?);base64,/);
  return match?.[1] ?? "image/jpeg";
}

function extensionFromMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
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
    reader.onerror = () => reject(new Error("Could not read downloaded memory photo."));
    reader.readAsDataURL(blob);
  });
}

async function uploadMemoryImagesToStorage(
  client: SupabaseClient,
  userId: string,
  packageData: unknown,
): Promise<unknown> {
  if (!isRecord(packageData)) return packageData;

  const cloned = cloneJson(packageData);
  const memories = Array.isArray(cloned.memories) ? cloned.memories : [];

  for (const rawMemory of memories) {
    if (!isRecord(rawMemory)) continue;

    const memory = rawMemory as CloudMemoryRecord;

    if (typeof memory.id !== "string") continue;
    if (typeof memory.imageDataUrl !== "string") continue;
    if (!memory.imageDataUrl.startsWith("data:image/")) continue;

    const mime = getDataUrlMime(memory.imageDataUrl);
    const extension = extensionFromMime(mime);
    const storagePath = `${userId}/${memory.id}.${extension}`;
    const imageBlob = dataUrlToBlob(memory.imageDataUrl);

    const { error } = await client.storage.from(memoryPhotosBucket).upload(storagePath, imageBlob, {
      cacheControl: "31536000",
      contentType: mime,
      upsert: true,
    });

    if (error) {
      throw new Error(`Could not upload memory photo: ${error.message}`);
    }

    memory.imageStoragePath = storagePath;
    memory.imageContentType = mime;
    delete memory.imageDataUrl;
  }

  cloned.storage = "supabase-json-plus-storage";
  cloned.storageBucket = memoryPhotosBucket;

  return cloned;
}

async function hydrateMemoryImagesFromStorage(client: SupabaseClient, packageData: unknown): Promise<unknown> {
  if (!isRecord(packageData)) return packageData;

  const cloned = cloneJson(packageData);
  const memories = Array.isArray(cloned.memories) ? cloned.memories : [];

  for (const rawMemory of memories) {
    if (!isRecord(rawMemory)) continue;

    const memory = rawMemory as CloudMemoryRecord;

    if (typeof memory.imageDataUrl === "string" && memory.imageDataUrl.startsWith("data:image/")) {
      continue;
    }

    if (typeof memory.imageStoragePath !== "string") {
      continue;
    }

    const { data, error } = await client.storage.from(memoryPhotosBucket).download(memory.imageStoragePath);

    if (error) {
      throw new Error(`Could not restore memory photo: ${error.message}`);
    }

    memory.imageDataUrl = await blobToDataUrl(data);
  }

  return cloned;
}

async function deleteUserMemoryPhotos(client: SupabaseClient, userId: string): Promise<void> {
  const { data, error } = await client.storage.from(memoryPhotosBucket).list(userId, {
    limit: 1000,
  });

  if (error) {
    throw new Error(`Could not list memory photos: ${error.message}`);
  }

  const files = data ?? [];

  if (files.length === 0) return;

  const paths = files.map((file) => `${userId}/${file.name}`);

  const { error: removeError } = await client.storage.from(memoryPhotosBucket).remove(paths);

  if (removeError) {
    throw new Error(`Could not remove memory photos: ${removeError.message}`);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const client = requireSupabase();
  const { data, error } = await client.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
}

export async function signInWithEmail(email: string): Promise<void> {
  const client = requireSupabase();

  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/sync`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signOutOfCloud(): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function saveCloudPackage(data: unknown): Promise<void> {
  const client = requireSupabase();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Sign in before saving to cloud.");
  }

  const preparedData = await uploadMemoryImagesToStorage(client, user.id, data);

  const { error } = await client.from("care_packages").upsert(
    {
      user_id: user.id,
      data: preparedData,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function loadCloudPackage(): Promise<CloudCarePackage | null> {
  const client = requireSupabase();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Sign in before restoring from cloud.");
  }

  const { data, error } = await client
    .from("care_packages")
    .select("data, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return {
    data: await hydrateMemoryImagesFromStorage(client, data.data),
    updatedAt: String(data.updated_at),
  };
}

export async function deleteCloudPackage(): Promise<void> {
  const client = requireSupabase();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Sign in before deleting cloud data.");
  }

  const { error } = await client.from("care_packages").delete().eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  await deleteUserMemoryPhotos(client, user.id);
}
