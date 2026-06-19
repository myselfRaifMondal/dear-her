import type { Screen } from "../types/app";

export type OnboardingGoal = "calm-body" | "feel-held" | "quiet-space" | "make-care-package";
export type OnboardingVibe = "rain" | "moon" | "rose" | "forest";

export type OnboardingPreference = {
  goal: OnboardingGoal;
  vibe: OnboardingVibe;
  completedAt: string;
};

const onboardingCompleteKey = "dear-her-mvp:onboarding-complete";
const onboardingPreferenceKey = "dear-her-mvp:onboarding-preference";
const firstSessionGuideKey = "dear-her-mvp:first-session-guide-dismissed";

export function hasCompletedOnboarding(): boolean {
  try {
    return window.localStorage.getItem(onboardingCompleteKey) === "true";
  } catch {
    return false;
  }
}

export function completeOnboarding(preference: Omit<OnboardingPreference, "completedAt">): void {
  const completedPreference: OnboardingPreference = {
    ...preference,
    completedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(onboardingCompleteKey, "true");
  window.localStorage.setItem(onboardingPreferenceKey, JSON.stringify(completedPreference));
  window.localStorage.setItem(firstSessionGuideKey, "true");
}

export function getOnboardingPreference(): OnboardingPreference | null {
  try {
    const raw = window.localStorage.getItem(onboardingPreferenceKey);
    return raw ? (JSON.parse(raw) as OnboardingPreference) : null;
  } catch {
    return null;
  }
}

export function resetOnboarding(): void {
  window.localStorage.removeItem(onboardingCompleteKey);
  window.localStorage.removeItem(onboardingPreferenceKey);
  window.localStorage.removeItem(firstSessionGuideKey);
}

export function shouldShowFirstSessionGuide(): boolean {
  try {
    return !hasCompletedOnboarding() && window.localStorage.getItem(firstSessionGuideKey) !== "true";
  } catch {
    return false;
  }
}

export function dismissFirstSessionGuide(): void {
  window.localStorage.setItem(firstSessionGuideKey, "true");
}

export function getRecommendedScreen(goal: OnboardingGoal): Screen {
  if (goal === "calm-body") return "breathe";
  if (goal === "feel-held") return "mira";
  if (goal === "quiet-space") return "room";
  return "care";
}
