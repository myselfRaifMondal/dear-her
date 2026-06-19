export type CarePackageTone = "warmth" | "breathing" | "quiet" | "love" | "sleep";

export type CarePackageRoom = "rose" | "moon" | "rain" | "forest" | "ocean";

export type CarePackageData = {
  version: 1;
  id: string;
  createdAt: string;
  creatorName: string;
  recipientName: string;
  title: string;
  openingNote: string;
  tone: CarePackageTone;
  room: CarePackageRoom;
  soundscape: string;
  gentleActions: string[];
  comfortMessages: string[];
};

const recentPackagesKey = "dear-her-mvp:care-packages";

function encodeUnicodeToBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return window
    .btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function decodeBase64UrlToUnicode(value: string): string {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary = window.atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

export function encodeCarePackage(data: CarePackageData): string {
  return encodeUnicodeToBase64Url(JSON.stringify(data));
}

export function decodeCarePackage(encoded: string): CarePackageData | null {
  try {
    const parsed = JSON.parse(decodeBase64UrlToUnicode(encoded)) as CarePackageData;

    if (parsed.version !== 1 || !parsed.id || !parsed.title) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function createCarePackageLink(data: CarePackageData): string {
  const encoded = encodeCarePackage(data);
  return `${window.location.origin}/care-package#package=${encoded}`;
}

export function getCarePackageFromCurrentUrl(): CarePackageData | null {
  const hash = window.location.hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);
  const encoded = params.get("package");

  if (!encoded) return null;

  return decodeCarePackage(encoded);
}

export function saveRecentCarePackage(data: CarePackageData): void {
  const current = loadRecentCarePackages();
  const updated = [data, ...current.filter((item) => item.id !== data.id)].slice(0, 12);

  window.localStorage.setItem(recentPackagesKey, JSON.stringify(updated));
}

export function loadRecentCarePackages(): CarePackageData[] {
  try {
    const raw = window.localStorage.getItem(recentPackagesKey);
    return raw ? (JSON.parse(raw) as CarePackageData[]) : [];
  } catch {
    return [];
  }
}

export function clearRecentCarePackages(): void {
  window.localStorage.removeItem(recentPackagesKey);
}
