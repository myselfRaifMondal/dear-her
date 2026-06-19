const founderModeKey = "dear-her-mvp:founder-mode";

export function getFounderAccessCode(): string {
  return import.meta.env.VITE_FOUNDER_ACCESS_CODE || "dearher-founder";
}

export function isFounderModeEnabled(): boolean {
  try {
    return window.localStorage.getItem(founderModeKey) === "true";
  } catch {
    return false;
  }
}

export function setFounderModeEnabled(enabled: boolean): void {
  window.localStorage.setItem(founderModeKey, String(enabled));
}

export function unlockFounderMode(code: string): boolean {
  const cleanCode = code.trim();
  const expectedCode = getFounderAccessCode();

  if (cleanCode === expectedCode) {
    setFounderModeEnabled(true);
    return true;
  }

  return false;
}

export function disableFounderMode(): void {
  setFounderModeEnabled(false);
}
