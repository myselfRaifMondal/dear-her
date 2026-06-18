import type { EnvironmentId, Mood } from "../types/app";

export const moods: Mood[] = [
  "Tender",
  "Heavy",
  "Tired",
  "Irritated",
  "Low",
  "Need comfort",
  "Need silence",
];

export const environments: Array<{
  id: EnvironmentId;
  name: string;
  description: string;
  feeling: string;
  palette: string;
}> = [
  {
    id: "rain",
    name: "Cozy Rain Room",
    description: "Rain on glass, a warm lamp, and a room that asks nothing from you.",
    feeling: "Protected",
    palette: "from-slate-950 via-indigo-950 to-rose-950",
  },
  {
    id: "forest",
    name: "Forest Retreat",
    description: "Soft mist, quiet trees, and tiny fireflies moving slowly in the dark.",
    feeling: "Grounded",
    palette: "from-emerald-950 via-slate-950 to-violet-950",
  },
  {
    id: "ocean",
    name: "Ocean Escape",
    description: "Moonlit waves, pearl glow, and a horizon that lets the mind widen.",
    feeling: "Released",
    palette: "from-blue-950 via-cyan-950 to-violet-950",
  },
  {
    id: "fireplace",
    name: "Fireplace Lounge",
    description: "Amber light, soft shadows, and crackling warmth for a heavy day.",
    feeling: "Held",
    palette: "from-stone-950 via-amber-950 to-rose-950",
  },
  {
    id: "night",
    name: "Night Sky Sanctuary",
    description: "Stars, aurora mist, and a quiet sky for when the heart feels loud.",
    feeling: "Softened",
    palette: "from-slate-950 via-violet-950 to-indigo-950",
  },
];

export const comfortMessages: Record<Mood | "default", string[]> = {
  Tender: [
    "You are allowed to be soft today. Nothing about that makes you weak.",
    "Your body is asking for gentleness, not judgment.",
    "Let this moment be smaller. One breath. One warm thought. One quiet pause.",
  ],
  Heavy: [
    "You do not have to carry the whole day at once.",
    "Rest is not a failure. It is care arriving in a quiet form.",
    "Put down whatever is not urgent. Your comfort matters right now.",
  ],
  Tired: [
    "There is nothing to prove in this moment. Let your body slow down.",
    "Close your eyes for a few seconds. The world can wait gently.",
    "You have done enough for now. Come back to yourself softly.",
  ],
  Irritated: [
    "It makes sense that everything feels too loud. You are not difficult for needing space.",
    "Take one slow exhale. You do not need to answer the world immediately.",
    "Your feelings are signals, not flaws. Give them a quieter room.",
  ],
  Low: [
    "You are not too much. You are a person having a difficult moment.",
    "Some days ask for tenderness before solutions. This can be one of them.",
    "You deserve care even when you cannot explain exactly what hurts.",
  ],
  "Need comfort": [
    "Imagine warmth around your shoulders. You are safe to pause here.",
    "Let this space hold the part of you that feels tired of being strong.",
    "You deserve to be comforted without having to earn it.",
  ],
  "Need silence": [
    "No fixing. No explaining. Just quiet, breath, and a softer minute.",
    "You can choose silence and still be deeply cared for.",
    "Let the noise fall away. You do not have to meet it right now.",
  ],
  default: [
    "Take a soft breath. You are allowed to rest here.",
    "This room is for the part of you that needs tenderness.",
    "You do not have to be strong every minute.",
  ],
};

export const activities = [
  {
    title: "Two-minute breathing",
    body: "Follow the orb for one soft cycle. No goal, no pressure.",
  },
  {
    title: "Warm drink ritual",
    body: "Hold a warm cup with both hands and notice the heat for ten slow breaths.",
  },
  {
    title: "Gentle stretch",
    body: "Unclench your jaw, lower your shoulders, and stretch only as much as feels kind.",
  },
  {
    title: "Comfort sentence",
    body: "Write one line you would say to someone you deeply care about. Then read it to yourself.",
  },
];
