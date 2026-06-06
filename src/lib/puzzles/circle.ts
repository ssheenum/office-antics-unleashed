// Circle Back — sequence memory with twists
export type Cell = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type RoundMode = "forward" | "reverse" | "swap";

export interface Round {
  mode: RoundMode;
  sequence: Cell[]; // shown to player
  expected: Cell[]; // what player must enter
  swapNote?: string; // for "swap"
}

const SYMBOLS = ["📌", "📎", "📈", "☕", "🖇️", "📅", "🗂️", "📤", "📑"];

export function getSymbol(c: Cell): string {
  return SYMBOLS[c];
}

function randomSeq(len: number): Cell[] {
  const out: Cell[] = [];
  for (let i = 0; i < len; i++) out.push(Math.floor(Math.random() * 9) as Cell);
  return out;
}

export function generateRound(roundIndex: number): Round {
  // length: 3 + roundIndex
  const len = Math.min(3 + roundIndex, 9);
  const seq = randomSeq(len);
  const modeIdx = roundIndex % 3;
  if (modeIdx === 0) {
    return { mode: "forward", sequence: seq, expected: seq };
  } else if (modeIdx === 1) {
    return { mode: "reverse", sequence: seq, expected: [...seq].reverse() };
  } else {
    // swap one item with a different symbol
    const expected = [...seq];
    const idx = Math.floor(Math.random() * len);
    let nv: Cell;
    do {
      nv = Math.floor(Math.random() * 9) as Cell;
    } while (nv === seq[idx]);
    expected[idx] = nv;
    return {
      mode: "swap",
      sequence: seq,
      expected,
      swapNote: `Replace ${getSymbol(seq[idx])} (slot ${idx + 1}) with ${getSymbol(nv)}.`,
    };
  }
}
