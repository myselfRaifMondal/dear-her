import type { Screen } from "../types/app";

export type DailySoftPlanStepId = "breathe" | "room" | "mira" | "save";

export type DailySoftPlanStep = {
  id: DailySoftPlanStepId;
  title: string;
  description: string;
  screen: Screen;
};

export type DailySoftPlan = {
  date: string;
  intention: string;
  energy: "low" | "medium" | "heavy";
  completedSteps: DailySoftPlanStepId[];
  lastScreen: Screen | null;
  createdAt: string;
  updatedAt: string;
};

const dailyPlanKey = "dear-her-v3:daily-soft-plan";

export const dailySoftPlanSteps: DailySoftPlanStep[] = [
  {
    id: "breathe",
    title: "Breathe",
    description: "One minute of visual calm.",
    screen: "breathe",
  },
  {
    id: "room",
    title: "Set the room",
    description: "Choose the atmosphere around you.",
    screen: "room",
  },
  {
    id: "mira",
    title: "Ask Mira",
    description: "Receive softer words without pressure.",
    screen: "mira",
  },
  {
    id: "save",
    title: "Keep what helps",
    description: "Save a memory, favorite, or message.",
    screen: "you",
  },
];

function todayKey(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createDefaultPlan(): DailySoftPlan {
  const now = new Date().toISOString();

  return {
    date: todayKey(),
    intention: "Make today 5% softer.",
    energy: "low",
    completedSteps: [],
    lastScreen: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function loadDailySoftPlan(): DailySoftPlan {
  try {
    const raw = window.localStorage.getItem(dailyPlanKey);

    if (!raw) {
      const plan = createDefaultPlan();
      saveDailySoftPlan(plan);
      return plan;
    }

    const parsed = JSON.parse(raw) as DailySoftPlan;

    if (parsed.date !== todayKey()) {
      const plan = createDefaultPlan();
      saveDailySoftPlan(plan);
      return plan;
    }

    return parsed;
  } catch {
    const plan = createDefaultPlan();
    saveDailySoftPlan(plan);
    return plan;
  }
}

export function saveDailySoftPlan(plan: DailySoftPlan): void {
  window.localStorage.setItem(
    dailyPlanKey,
    JSON.stringify({
      ...plan,
      updatedAt: new Date().toISOString(),
    }),
  );
}

export function updateDailyIntention(intention: string): DailySoftPlan {
  const plan = loadDailySoftPlan();
  const updated = {
    ...plan,
    intention: intention.trim() || "Make today 5% softer.",
    updatedAt: new Date().toISOString(),
  };

  saveDailySoftPlan(updated);
  return updated;
}

export function updateDailyEnergy(energy: DailySoftPlan["energy"]): DailySoftPlan {
  const plan = loadDailySoftPlan();
  const updated = {
    ...plan,
    energy,
    updatedAt: new Date().toISOString(),
  };

  saveDailySoftPlan(updated);
  return updated;
}

export function markDailyStepComplete(stepId: DailySoftPlanStepId): DailySoftPlan {
  const plan = loadDailySoftPlan();

  const updated = {
    ...plan,
    completedSteps: Array.from(new Set([...plan.completedSteps, stepId])),
    updatedAt: new Date().toISOString(),
  };

  saveDailySoftPlan(updated);
  return updated;
}

export function setLastDailyScreen(screen: Screen): DailySoftPlan {
  const plan = loadDailySoftPlan();

  const updated = {
    ...plan,
    lastScreen: screen,
    updatedAt: new Date().toISOString(),
  };

  saveDailySoftPlan(updated);
  return updated;
}

export function resetDailySoftPlan(): DailySoftPlan {
  const plan = createDefaultPlan();
  saveDailySoftPlan(plan);
  return plan;
}

export function getDailyProgress(plan: DailySoftPlan): number {
  return Math.round((plan.completedSteps.length / dailySoftPlanSteps.length) * 100);
}

export function getNextDailyStep(plan: DailySoftPlan): DailySoftPlanStep {
  return dailySoftPlanSteps.find((step) => !plan.completedSteps.includes(step.id)) ?? dailySoftPlanSteps[0];
}
