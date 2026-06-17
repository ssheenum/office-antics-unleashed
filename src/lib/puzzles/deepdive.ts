// Deep Dive — Treasure Detective.
// 5×5 grid, props scattered, treasure hidden, clues identify a unique tile.

export type PropKind =
  | "redCoral" | "blueCoral" | "jellyfish" | "turtle"
  | "anchor" | "seaweed" | "bubble" | "shell";

export const PROP_LABEL: Record<PropKind, string> = {
  redCoral: "red poppy",
  blueCoral: "bellflower",
  jellyfish: "butterfly",
  turtle: "snail",
  anchor: "watering can",
  seaweed: "fern",
  bubble: "pebble",
  shell: "mushroom",
};

export interface Tile { x: number; y: number; prop: PropKind | null; }
export const SIZE = 5;

export type ClueKind =
  | { type: "above"; prop: PropKind }
  | { type: "below"; prop: PropKind }
  | { type: "leftOf"; prop: PropKind }
  | { type: "rightOf"; prop: PropKind }
  | { type: "nextTo"; prop: PropKind }
  | { type: "notNextTo"; prop: PropKind }
  | { type: "between"; a: PropKind; b: PropKind }
  | { type: "within1"; prop: PropKind }
  | { type: "exactly2"; prop: PropKind }
  | { type: "nearBubbles"; n: number }
  | { type: "notTouchingSeaweed" };

export interface Puzzle {
  grid: Tile[];                 // SIZE*SIZE
  treasure: { x: number; y: number };
  clues: ClueKind[];
  difficulty: number;           // 1..5
}

function rnd(n: number) { return Math.floor(Math.random() * n); }
function pick<T>(a: T[]): T { return a[rnd(a.length)]; }

function tilesWith(grid: Tile[], kind: PropKind) {
  return grid.filter((t) => t.prop === kind);
}
function tileAt(grid: Tile[], x: number, y: number) {
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return null;
  return grid[y * SIZE + x];
}
function neighbors4(x: number, y: number) {
  return [[x+1,y],[x-1,y],[x,y+1],[x,y-1]] as [number, number][];
}
function manhattan(a: {x:number;y:number}, b: {x:number;y:number}) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function clueDescribe(c: ClueKind): string {
  switch (c.type) {
    case "above":    return `It is above a ${PROP_LABEL[c.prop]}.`;
    case "below":    return `It is below a ${PROP_LABEL[c.prop]}.`;
    case "leftOf":   return `It is left of a ${PROP_LABEL[c.prop]}.`;
    case "rightOf":  return `It is right of a ${PROP_LABEL[c.prop]}.`;
    case "nextTo":   return `It is right next to a ${PROP_LABEL[c.prop]}.`;
    case "notNextTo":return `It is NOT next to any ${PROP_LABEL[c.prop]}.`;
    case "between":  return `It sits between a ${PROP_LABEL[c.a]} and a ${PROP_LABEL[c.b]} (in a straight line).`;
    case "within1":  return `It is within one tile of a ${PROP_LABEL[c.prop]}.`;
    case "exactly2": return `It is exactly two tiles from a ${PROP_LABEL[c.prop]}.`;
    case "nearBubbles": return `It is next to exactly ${c.n} pebble${c.n === 1 ? "" : "s"}.`;
    case "notTouchingSeaweed": return `It is not touching a fern.`;
  }
}
export { clueDescribe };

function clueHolds(grid: Tile[], cand: {x:number;y:number}, c: ClueKind): boolean {
  switch (c.type) {
    case "above":
      return tilesWith(grid, c.prop).some((t) => t.x === cand.x && t.y === cand.y + 1);
    case "below":
      return tilesWith(grid, c.prop).some((t) => t.x === cand.x && t.y === cand.y - 1);
    case "leftOf":
      return tilesWith(grid, c.prop).some((t) => t.y === cand.y && t.x === cand.x + 1);
    case "rightOf":
      return tilesWith(grid, c.prop).some((t) => t.y === cand.y && t.x === cand.x - 1);
    case "nextTo":
      return neighbors4(cand.x, cand.y).some(([nx,ny]) => tileAt(grid, nx, ny)?.prop === c.prop);
    case "notNextTo":
      return !neighbors4(cand.x, cand.y).some(([nx,ny]) => tileAt(grid, nx, ny)?.prop === c.prop);
    case "between": {
      const as = tilesWith(grid, c.a), bs = tilesWith(grid, c.b);
      for (const a of as) for (const b of bs) {
        if (a.x === b.x && a.x === cand.x) {
          const lo = Math.min(a.y, b.y), hi = Math.max(a.y, b.y);
          if (cand.y > lo && cand.y < hi) return true;
        }
        if (a.y === b.y && a.y === cand.y) {
          const lo = Math.min(a.x, b.x), hi = Math.max(a.x, b.x);
          if (cand.x > lo && cand.x < hi) return true;
        }
      }
      return false;
    }
    case "within1":
      return tilesWith(grid, c.prop).some((t) => manhattan(t, cand) <= 1 && !(t.x===cand.x && t.y===cand.y));
    case "exactly2":
      return tilesWith(grid, c.prop).some((t) => manhattan(t, cand) === 2);
    case "nearBubbles": {
      const count = neighbors4(cand.x, cand.y).filter(([nx,ny]) => tileAt(grid, nx, ny)?.prop === "bubble").length;
      return count === c.n;
    }
    case "notTouchingSeaweed":
      return !neighbors4(cand.x, cand.y).some(([nx,ny]) => tileAt(grid, nx, ny)?.prop === "seaweed");
  }
}

function makeGrid(seedProps: { kind: PropKind; count: number }[]): Tile[] {
  const grid: Tile[] = Array.from({ length: SIZE * SIZE }, (_, i) => ({
    x: i % SIZE, y: Math.floor(i / SIZE), prop: null,
  }));
  const slots = [...grid];
  // place props
  for (const sp of seedProps) {
    for (let k = 0; k < sp.count; k++) {
      const empty = slots.filter((t) => t.prop === null);
      if (!empty.length) return grid;
      const pickT = empty[rnd(empty.length)];
      pickT.prop = sp.kind;
    }
  }
  return grid;
}

function candidateClues(grid: Tile[], cand: {x:number;y:number}, allowedKinds: ClueKind["type"][]): ClueKind[] {
  const out: ClueKind[] = [];
  const presentProps = new Set(grid.map((t) => t.prop).filter(Boolean) as PropKind[]);
  for (const p of presentProps) {
    if (allowedKinds.includes("above")) out.push({ type: "above", prop: p });
    if (allowedKinds.includes("below")) out.push({ type: "below", prop: p });
    if (allowedKinds.includes("leftOf")) out.push({ type: "leftOf", prop: p });
    if (allowedKinds.includes("rightOf")) out.push({ type: "rightOf", prop: p });
    if (allowedKinds.includes("nextTo")) out.push({ type: "nextTo", prop: p });
    if (allowedKinds.includes("notNextTo")) out.push({ type: "notNextTo", prop: p });
    if (allowedKinds.includes("within1")) out.push({ type: "within1", prop: p });
    if (allowedKinds.includes("exactly2")) out.push({ type: "exactly2", prop: p });
  }
  if (allowedKinds.includes("between")) {
    const arr = [...presentProps];
    for (let i = 0; i < arr.length; i++)
      for (let j = i + 1; j < arr.length; j++)
        out.push({ type: "between", a: arr[i], b: arr[j] });
  }
  if (allowedKinds.includes("nearBubbles") && presentProps.has("bubble")) {
    out.push({ type: "nearBubbles", n: 1 });
    out.push({ type: "nearBubbles", n: 2 });
  }
  if (allowedKinds.includes("notTouchingSeaweed") && presentProps.has("seaweed")) {
    out.push({ type: "notTouchingSeaweed" });
  }
  return out.filter((c) => clueHolds(grid, cand, c));
}

function uniqueWith(grid: Tile[], cand: {x:number;y:number}, clues: ClueKind[]): boolean {
  let matches = 0;
  for (const t of grid) {
    if (t.prop !== null) continue;
    if (clues.every((c) => clueHolds(grid, { x: t.x, y: t.y }, c))) {
      matches++;
      if (matches > 1) return false;
    }
  }
  // ensure the candidate itself is empty and matches
  const ct = tileAt(grid, cand.x, cand.y);
  if (!ct || ct.prop !== null) return false;
  return matches === 1;
}

function buildPuzzle(level: number): Puzzle {
  // friendlier difficulty curve — clue budget never exceeds 3
  const diff = Math.min(5, level);
  let clueBudget: number;
  let allowedKinds: ClueKind["type"][];
  let propCounts: { kind: PropKind; count: number }[];

  if (diff <= 1) {
    clueBudget = 1;
    allowedKinds = ["above", "below", "leftOf", "rightOf", "nextTo"];
    propCounts = [
      { kind: "redCoral", count: 1 },
      { kind: "turtle", count: 1 },
      { kind: "shell", count: 1 },
      { kind: "bubble", count: 1 },
    ];
  } else if (diff <= 3) {
    clueBudget = 2;
    allowedKinds = ["above", "below", "leftOf", "rightOf", "nextTo", "within1"];
    propCounts = [
      { kind: "redCoral", count: 1 },
      { kind: "blueCoral", count: 1 },
      { kind: "turtle", count: 1 },
      { kind: "shell", count: 1 },
      { kind: "bubble", count: 2 },
      { kind: "seaweed", count: 1 },
    ];
  } else {
    clueBudget = 3;
    allowedKinds = ["above", "below", "leftOf", "rightOf", "nextTo", "notNextTo", "within1", "notTouchingSeaweed"];
    propCounts = [
      { kind: "redCoral", count: 1 },
      { kind: "blueCoral", count: 1 },
      { kind: "jellyfish", count: 1 },
      { kind: "turtle", count: 1 },
      { kind: "anchor", count: 1 },
      { kind: "bubble", count: 2 },
      { kind: "seaweed", count: 1 },
    ];
  }

  for (let attempt = 0; attempt < 300; attempt++) {
    const grid = makeGrid(propCounts);
    const empties = grid.filter((t) => t.prop === null);
    if (!empties.length) continue;
    const treasure = pick(empties);
    const trueClues = candidateClues(grid, treasure, allowedKinds);
    if (trueClues.length < clueBudget) continue;

    // greedy minimal cover toward uniqueness
    const chosen: ClueKind[] = [];
    const shuffled = [...trueClues].sort(() => Math.random() - 0.5);
    for (const c of shuffled) {
      chosen.push(c);
      if (chosen.length >= clueBudget && uniqueWith(grid, treasure, chosen)) break;
    }
    if (chosen.length > clueBudget) {
      // try trimming
      for (let i = chosen.length - 1; i >= 0 && chosen.length > clueBudget; i--) {
        const test = chosen.filter((_, j) => j !== i);
        if (uniqueWith(grid, treasure, test)) chosen.splice(i, 1);
      }
    }
    if (uniqueWith(grid, treasure, chosen)) {
      return { grid, treasure: { x: treasure.x, y: treasure.y }, clues: chosen, difficulty: diff };
    }
  }

  // fallback: trivial puzzle
  const grid = makeGrid([{ kind: "redCoral", count: 1 }, { kind: "bubble", count: 2 }]);
  const empties = grid.filter((t) => t.prop === null);
  const treasure = empties[0];
  return {
    grid, treasure: { x: treasure.x, y: treasure.y },
    clues: [{ type: "leftOf", prop: "redCoral" }],
    difficulty: 1,
  };
}

export function generateDeepDive(level: number): Puzzle {
  return buildPuzzle(level);
}
