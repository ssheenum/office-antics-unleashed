// Deep Dive — sea creatures rise from the depths; tap the one matching the current hunt.
export type StratumTag = "FISH" | "CRAB" | "EEL" | "RAY" | "ORCA";
export type StratumIcon = "chart" | "doc" | "bug" | "star" | "flag";
export type StratumTone = "indigo" | "teal" | "amber" | "rose" | "violet";

export interface Stratum {
  id: number;
  tag: StratumTag;
  icon: StratumIcon;
  tone: StratumTone;
  spawnAt: number; // ms timestamp
}

export type Brief =
  | { kind: "tag"; tag: StratumTag; label: string }
  | { kind: "icon"; icon: StratumIcon; label: string }
  | { kind: "tone"; tone: StratumTone; label: string };

const TAGS: StratumTag[] = ["FISH", "CRAB", "EEL", "RAY", "ORCA"];
const ICONS: StratumIcon[] = ["chart", "doc", "bug", "star", "flag"];
const TONES: StratumTone[] = ["indigo", "teal", "amber", "rose", "violet"];

const ICON_LABEL: Record<StratumIcon, string> = {
  chart: "wave", doc: "shell", bug: "kraken", star: "starfish", flag: "anchor",
};

const TONE_LABEL: Record<StratumTone, string> = {
  indigo: "deep-sea", teal: "lagoon", amber: "sunlit", rose: "coral", violet: "twilight",
};

export const TONE_HEX: Record<StratumTone, string> = {
  indigo: "#6366f1",
  teal: "#14b8a6",
  amber: "#f59e0b",
  rose: "#f43f5e",
  violet: "#a78bfa",
};

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

let nextId = 1;

export function spawnStratum(now: number): Stratum {
  return {
    id: nextId++,
    tag: pick(TAGS),
    icon: pick(ICONS),
    tone: pick(TONES),
    spawnAt: now,
  };
}

export function newBrief(): Brief {
  const kind = Math.floor(Math.random() * 3);
  if (kind === 0) {
    const tag = pick(TAGS);
    return { kind: "tag", tag, label: `a ${tag}` };
  }
  if (kind === 1) {
    const icon = pick(ICONS);
    return { kind: "icon", icon, label: `${ICON_LABEL[icon]} marker` };
  }
  const tone = pick(TONES);
  return { kind: "tone", tone, label: `${TONE_LABEL[tone]} glow` };
}

export function matches(s: Stratum, b: Brief): boolean {
  if (b.kind === "tag") return s.tag === b.tag;
  if (b.kind === "icon") return s.icon === b.icon;
  return s.tone === b.tone;
}
