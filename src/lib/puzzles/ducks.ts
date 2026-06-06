// Ducks in a Row — Einstein-style deduction puzzle
// Each duck has unique color + accessory + role. Player arranges N ducks in a row to satisfy constraints.

export const COLORS = ["yellow", "pink", "green", "blue", "orange", "purple", "white"] as const;
export const ACCESSORIES = ["tie", "scarf", "glasses", "hat", "headphones", "badge", "monocle"] as const;
export const ROLES = ["intern", "manager", "designer", "engineer", "analyst", "exec", "recruiter"] as const;

export type Color = (typeof COLORS)[number];
export type Accessory = (typeof ACCESSORIES)[number];
export type Role = (typeof ROLES)[number];

export interface Duck {
  id: number;
  color: Color;
  accessory: Accessory;
  role: Role;
}

export type Constraint =
  | { kind: "position"; attr: "color" | "accessory" | "role"; value: string; pos: number }
  | { kind: "leftOf"; a: AttrRef; b: AttrRef }
  | { kind: "adjacent"; a: AttrRef; b: AttrRef }
  | { kind: "notAdjacent"; a: AttrRef; b: AttrRef }
  | { kind: "edge"; a: AttrRef }
  | { kind: "between"; a: AttrRef; b: AttrRef; c: AttrRef };

export interface AttrRef {
  attr: "color" | "accessory" | "role";
  value: string;
}

export interface Puzzle {
  n: number;
  ducks: Duck[]; // pool (unordered)
  solution: number[]; // duck ids in order
  constraints: Constraint[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function indexOfAttr(order: Duck[], ref: AttrRef): number {
  return order.findIndex((d) => (d as any)[ref.attr] === ref.value);
}

export function checkConstraint(order: (Duck | null)[], c: Constraint): boolean {
  const filled = order.every(Boolean) ? (order as Duck[]) : null;
  if (!filled) return false; // require complete arrangement
  switch (c.kind) {
    case "position":
      return (filled[c.pos] as any)[c.attr] === c.value;
    case "leftOf":
      return indexOfAttr(filled, c.a) < indexOfAttr(filled, c.b);
    case "adjacent":
      return Math.abs(indexOfAttr(filled, c.a) - indexOfAttr(filled, c.b)) === 1;
    case "notAdjacent":
      return Math.abs(indexOfAttr(filled, c.a) - indexOfAttr(filled, c.b)) !== 1;
    case "edge": {
      const i = indexOfAttr(filled, c.a);
      return i === 0 || i === filled.length - 1;
    }
    case "between": {
      const ia = indexOfAttr(filled, c.a);
      const ib = indexOfAttr(filled, c.b);
      const ic = indexOfAttr(filled, c.c);
      return (ia < ib && ib < ic) || (ic < ib && ib < ia);
    }
  }
}

export function describe(c: Constraint): string {
  const fmt = (r: AttrRef) => `${r.value} ${r.attr === "color" ? "duck" : r.attr === "accessory" ? "(accessory)" : "duck"}`;
  switch (c.kind) {
    case "position":
      return `The ${c.value} ${c.attr === "color" ? "duck" : c.attr} sits at position ${c.pos + 1}.`;
    case "leftOf":
      return `The ${c.a.value} ${c.a.attr} is somewhere LEFT of the ${c.b.value} ${c.b.attr}.`;
    case "adjacent":
      return `The ${c.a.value} ${c.a.attr} is right next to the ${c.b.value} ${c.b.attr}.`;
    case "notAdjacent":
      return `The ${c.a.value} ${c.a.attr} is NOT next to the ${c.b.value} ${c.b.attr}.`;
    case "edge":
      return `The ${c.a.value} ${c.a.attr} sits at one of the two ends.`;
    case "between":
      return `The ${c.b.value} ${c.b.attr} sits BETWEEN the ${c.a.value} ${c.a.attr} and the ${c.c.value} ${c.c.attr}.`;
  }
  void fmt;
}

export function generate(n: number = 5): Puzzle {
  const colors = shuffle([...COLORS]).slice(0, n);
  const accs = shuffle([...ACCESSORIES]).slice(0, n);
  const roles = shuffle([...ROLES]).slice(0, n);
  const ducks: Duck[] = colors.map((c, i) => ({ id: i, color: c, accessory: accs[i], role: roles[i] }));
  const solution = shuffle(ducks).map((d) => d.id);
  const ordered: Duck[] = solution.map((id) => ducks.find((d) => d.id === id)!);

  const cs: Constraint[] = [];
  const target = n + 2;
  const tries = 200;
  let t = 0;
  while (cs.length < target && t++ < tries) {
    const kind = Math.floor(Math.random() * 5);
    const pick = (): AttrRef => {
      const attr = (["color", "accessory", "role"] as const)[Math.floor(Math.random() * 3)];
      const d = ordered[Math.floor(Math.random() * n)];
      return { attr, value: (d as any)[attr] };
    };
    let c: Constraint;
    if (kind === 0) {
      const a = pick();
      c = { kind: "position", attr: a.attr, value: a.value, pos: ordered.findIndex((d) => (d as any)[a.attr] === a.value) };
    } else if (kind === 1) {
      const a = pick(); const b = pick();
      if (a.attr === b.attr && a.value === b.value) continue;
      const ai = indexOfAttr(ordered, a), bi = indexOfAttr(ordered, b);
      c = ai < bi ? { kind: "leftOf", a, b } : { kind: "leftOf", a: b, b: a };
    } else if (kind === 2) {
      const a = pick(); const b = pick();
      if (a.attr === b.attr && a.value === b.value) continue;
      const ai = indexOfAttr(ordered, a), bi = indexOfAttr(ordered, b);
      if (Math.abs(ai - bi) !== 1) continue;
      c = { kind: "adjacent", a, b };
    } else if (kind === 3) {
      const a = pick(); const b = pick();
      if (a.attr === b.attr && a.value === b.value) continue;
      const ai = indexOfAttr(ordered, a), bi = indexOfAttr(ordered, b);
      if (Math.abs(ai - bi) === 1) continue;
      c = { kind: "notAdjacent", a, b };
    } else {
      const a = pick();
      const ai = indexOfAttr(ordered, a);
      if (ai !== 0 && ai !== n - 1) continue;
      c = { kind: "edge", a };
    }
    // dedupe
    if (cs.some((x) => JSON.stringify(x) === JSON.stringify(c))) continue;
    cs.push(c);
  }

  return { n, ducks: shuffle(ducks), solution, constraints: cs };
}

export const DUCK_COLOR_HEX: Record<Color, string> = {
  yellow: "#f4d03f",
  pink: "#f5a3b8",
  green: "#7cc28e",
  blue: "#7cb8e0",
  orange: "#f0a05a",
  purple: "#b598d4",
  white: "#f4f1e8",
};
