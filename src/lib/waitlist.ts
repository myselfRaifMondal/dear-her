import { isSupabaseConfigured, supabase } from "./supabaseClient";

export type WaitlistInterest = "comfort" | "care-package" | "mira" | "testing" | "partner";

export type WaitlistEntry = {
  id: string;
  email: string;
  name: string;
  interest: WaitlistInterest;
  reason: string;
  inviteCode: string;
  referredBy: string | null;
  sourcePath: string;
  createdAt: string;
  storage: "supabase" | "local";
};

export type WaitlistSubmitResult = {
  status: "joined" | "already_joined" | "saved_locally";
  inviteCode: string;
  storage: "supabase" | "local";
};

const localWaitlistKey = "dear-her-mvp:local-waitlist";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  const clean = normalizeEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
}

export function createInviteCode(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);

  return Array.from(bytes)
    .map((byte) => byte.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 12);
}

export function getReferralCodeFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("ref") || params.get("invite") || null;
}

export function createInviteLink(inviteCode: string): string {
  return `${window.location.origin}/waitlist?ref=${encodeURIComponent(inviteCode)}`;
}

export function loadLocalWaitlistEntries(): WaitlistEntry[] {
  try {
    const raw = window.localStorage.getItem(localWaitlistKey);
    return raw ? (JSON.parse(raw) as WaitlistEntry[]) : [];
  } catch {
    return [];
  }
}

function saveLocalWaitlistEntry(entry: WaitlistEntry): void {
  const current = loadLocalWaitlistEntries();
  const updated = [entry, ...current.filter((item) => item.email !== entry.email)].slice(0, 100);

  window.localStorage.setItem(localWaitlistKey, JSON.stringify(updated));
}

export function exportLocalWaitlistEntries(): void {
  const entries = loadLocalWaitlistEntries();

  const blob = new Blob(
    [
      JSON.stringify(
        {
          product: "Dear Her",
          type: "local_beta_waitlist",
          exportedAt: new Date().toISOString(),
          totalEntries: entries.length,
          entries,
        },
        null,
        2,
      ),
    ],
    { type: "application/json" },
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `dear-her-local-waitlist-${new Date().toISOString().slice(0, 10)}.json`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export async function submitWaitlistEntry(input: {
  email: string;
  name: string;
  interest: WaitlistInterest;
  reason: string;
}): Promise<WaitlistSubmitResult> {
  const email = normalizeEmail(input.email);
  const inviteCode = createInviteCode();
  const referredBy = getReferralCodeFromUrl();

  if (!isValidEmail(email)) {
    throw new Error("Please enter a valid email address.");
  }

  const localEntry: WaitlistEntry = {
    id: crypto.randomUUID(),
    email,
    name: input.name.trim(),
    interest: input.interest,
    reason: input.reason.trim(),
    inviteCode,
    referredBy,
    sourcePath: window.location.pathname,
    createdAt: new Date().toISOString(),
    storage: isSupabaseConfigured ? "supabase" : "local",
  };

  if (!isSupabaseConfigured || !supabase) {
    saveLocalWaitlistEntry({
      ...localEntry,
      storage: "local",
    });

    return {
      status: "saved_locally",
      inviteCode,
      storage: "local",
    };
  }

  const { error } = await supabase.from("beta_waitlist").insert({
    email,
    name: input.name.trim() || null,
    interest: input.interest,
    reason: input.reason.trim() || null,
    invite_code: inviteCode,
    referred_by: referredBy,
    source_path: window.location.pathname,
    user_agent: window.navigator.userAgent,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        status: "already_joined",
        inviteCode,
        storage: "supabase",
      };
    }

    saveLocalWaitlistEntry({
      ...localEntry,
      storage: "local",
    });

    return {
      status: "saved_locally",
      inviteCode,
      storage: "local",
    };
  }

  return {
    status: "joined",
    inviteCode,
    storage: "supabase",
  };
}
