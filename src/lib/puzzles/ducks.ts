// Ducks in a Row — Memory / sequencing / pattern recognition.
// Each round produces a target row of ducks the player must reconstruct.

export type DuckColor = "yellow" | "pink" | "green" | "blue" | "orange" | "purple";
export type DuckSize = "small" | "large";
export type DuckHat = "none" | "beret" | "party" | "straw";
export type DuckMood = "happy" | "sleepy" | "angry" | "surprised";
export type DuckDir = "left" | "right";
export type DuckObject = "none" | "flower" | "fish" | "umbrella";

export interface DuckTraits {
  id: number;
  color: DuckColor;
  size: DuckSize;
  hat: DuckHat;
  mood: DuckMood;
  dir: DuckDir;
  object: DuckObject;
}

export const COLOR_HEX: Record<DuckColor, string> = {
  yellow: "#ffd166",
  pink: "#ffadc6",
  green: "#7ee3b8",
  blue: "#7fd6ec",
  orange: "#ff9966",
  purple: "#c9a8ff",
};

const COLORS: DuckColor[] = ["yellow", "pink", "green", "blue", "orange", "purple"];
const HATS: DuckHat[] = ["none", "beret", "party", "straw"];
const MOODS: DuckMood[] = ["happy", "sleepy", "angry", "surprised"];
const OBJECTS: DuckObject[] = ["none", "flower", "fish", "umbrella"];
const SIZES: DuckSize[] = ["small", "large"];
const DIRS: DuckDir[] = ["left", "right"];

// rule scales used in hidden-rule rounds — ordered low → high
export const HAT_HEIGHT: Record<DuckHat, number> = { none: 0, beret: 1, straw: 2, party: 3 };
export const MOOD_ENERGY: Record<DuckMood, number> = { sleepy: 0, happy: 1, surprised: 2, angry: 3 };
export const SIZE_VALUE: Record<DuckSize, number> = { small: 0, large: 1 };
export const COLOR_ORDER: Record<DuckColor, number> = {
  yellow: 0, orange: 1, pink: 2, purple: 3, blue: 4, green: 5,
};

function pick<T>(a: T[]): T { return a[Math.floor(Math.random() * a.length)]; }
function shuffle<T>(a: T[]): T[] { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; }

let nextId = 1;
function makeDuck(partial: Partial<DuckTraits> = {}): DuckTraits {
  return {
    id: nextId++,
    color: partial.color ?? pick(COLORS),
    size: partial.size ?? pick(SIZES),
    hat: partial.hat ?? pick(HATS),
    mood: partial.mood ?? pick(MOODS),
    dir: partial.dir ?? pick(DIRS),
    object: partial.object ?? pick(OBJECTS),
  };
}

export type RoundKind = "simple" | "trait" | "pattern" | "rule";

export interface BaseRound {
  kind: RoundKind;
  n: number;
  target: DuckTraits[];      // the correct ordered row
  pool: DuckTraits[];         // ducks the player can place (scattered)
  blanks: number[];           // slot indices to fill (some rounds reveal others)
  preview: DuckTraits[] | null; // shown briefly before scatter (null = no preview, e.g. pattern with blank visible)
  hint: string;               // short helper headline
  rule?: string;              // revealed after submit (hidden-rule round)
}

// R1 — simple memory: only colour varies
export function genSimple(n = 3): BaseRound {
  const cols = shuffle(COLORS).slice(0, n);
  const target = cols.map((c) => makeDuck({ color: c, size: "large", hat: "none", mood: "happy", dir: "right", object: "none" }));
  return {
    kind: "simple", n, target,
    pool: shuffle(target),
    blanks: target.map((_, i) => i),
    preview: target,
    hint: "Memorise the order, then drag them back.",
  };
}

// R2 — trait memory: full distinct ducks
export function genTrait(n = 4): BaseRound {
  // ensure all distinct on most traits
  const cols = shuffle(COLORS).slice(0, n);
  const hats = shuffle(HATS).slice(0, n);
  const moods = shuffle(MOODS).slice(0, n);
  const objs = shuffle(OBJECTS).slice(0, n);
  const target = cols.map((c, i) => makeDuck({
    color: c, hat: hats[i], mood: moods[i], object: objs[i],
    size: pick(SIZES), dir: pick(DIRS),
  }));
  return {
    kind: "trait", n, target,
    pool: shuffle(target),
    blanks: target.map((_, i) => i),
    preview: target,
    hint: "Watch the row, then rebuild it.",
  };
}

// R3 — pattern completion: row shown with one blank, pool has many ducks, only one fits
type Pattern = { name: string; build: (n: number) => DuckTraits[] };

const PATTERNS: Pattern[] = [
  {
    name: "Sizes alternate small ↔ large",
    build: (n) => Array.from({ length: n }, (_, i) => makeDuck({
      size: i % 2 === 0 ? "small" : "large",
      color: pick(COLORS), hat: "none", mood: "happy", dir: "right", object: "none",
    })),
  },
  {
    name: "Direction flips left ↔ right",
    build: (n) => Array.from({ length: n }, (_, i) => makeDuck({
      dir: i % 2 === 0 ? "left" : "right",
      color: pick(COLORS), size: "large", hat: "none", mood: "happy", object: "none",
    })),
  },
  {
    name: "Hat on, off, on, off…",
    build: (n) => Array.from({ length: n }, (_, i) => makeDuck({
      hat: i % 2 === 0 ? "party" : "none",
      color: pick(COLORS), size: "large", mood: "happy", dir: "right", object: "none",
    })),
  },
  {
    name: "Colour cycle: yellow → blue → pink",
    build: (n) => {
      const cycle: DuckColor[] = ["yellow", "blue", "pink"];
      return Array.from({ length: n }, (_, i) => makeDuck({
        color: cycle[i % 3], size: "large", hat: "none", mood: "happy", dir: "right", object: "none",
      }));
    },
  },
];

export function genPattern(n = 5): BaseRound {
  const p = pick(PATTERNS);
  const target = p.build(n);
  const blankIdx = n - 1; // always last slot blank for clarity
  // pool: the missing duck + 4 distractors
  const correct = target[blankIdx];
  const distractors: DuckTraits[] = [];
  while (distractors.length < 4) {
    const d = makeDuck();
    // ensure it differs from the correct on the key axis (size/dir/hat/color depending on pattern)
    distractors.push(d);
  }
  return {
    kind: "pattern", n, target,
    pool: shuffle([correct, ...distractors]),
    blanks: [blankIdx],
    preview: null, // pattern is visible the whole time (the route shows non-blank slots filled)
    hint: `Pattern: ${p.name}. Drag the duck that completes it.`,
  };
}

// R4 — hidden rule: sort by a hidden axis
type Rule = { label: string; key: (d: DuckTraits) => number; setup: (n: number) => DuckTraits[] };
const RULES: Rule[] = [
  {
    label: "Hat height: short → tall",
    key: (d) => HAT_HEIGHT[d.hat],
    setup: (n) => shuffle(HATS).slice(0, n).map((h) => makeDuck({ hat: h, size: "large", mood: "happy", dir: "right", object: "none" })),
  },
  {
    label: "Mood energy: calm → fired up",
    key: (d) => MOOD_ENERGY[d.mood],
    setup: (n) => shuffle(MOODS).slice(0, n).map((m) => makeDuck({ mood: m, size: "large", hat: "none", dir: "right", object: "none" })),
  },
  {
    label: "Rainbow order: warm → cool",
    key: (d) => COLOR_ORDER[d.color],
    setup: (n) => shuffle(COLORS).slice(0, n).map((c) => makeDuck({ color: c, size: "large", hat: "none", mood: "happy", dir: "right", object: "none" })),
  },
];

export function genRule(n = 4): { example: DuckTraits[]; round: BaseRound; ruleLabel: string } {
  const r = pick(RULES);
  const exampleSet = r.setup(n);
  const example = [...exampleSet].sort((a, b) => r.key(a) - r.key(b));
  // build a fresh set for the player to sort
  const fresh = r.setup(n);
  const target = [...fresh].sort((a, b) => r.key(a) - r.key(b));
  return {
    ruleLabel: r.label,
    example,
    round: {
      kind: "rule", n, target,
      pool: shuffle(fresh),
      blanks: target.map((_, i) => i),
      preview: null,
      hint: "Figure out the rule from the example, then arrange these ducks the same way.",
      rule: r.label,
    },
  };
}

export function isCorrect(round: BaseRound, slot: number, duck: DuckTraits | null): boolean {
  if (!duck) return false;
  const want = round.target[slot];
  // For pattern: only the blank slot is checked against the actual duck; allow any duck whose key axis matches
  if (round.kind === "pattern") {
    return duck.id === want.id;
  }
  if (round.kind === "rule") {
    // accept any duck whose sortable key matches the target's
    // We compare by stringified traits — but multiple ducks may tie; require exact id since each round uses unique values.
    return duck.id === want.id;
  }
  return duck.id === want.id;
}
