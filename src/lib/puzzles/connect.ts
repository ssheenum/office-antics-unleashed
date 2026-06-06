// Connect the Dots — Connections-style grouping
export interface Group {
  category: string;
  difficulty: 1 | 2 | 3 | 4; // 1 easy, 4 hard
  words: string[];
}

export interface Board {
  groups: Group[]; // exactly 4
}

const BOARDS: Board[] = [
  {
    groups: [
      { category: "Citrus fruits", difficulty: 1, words: ["Lemon", "Lime", "Orange", "Grapefruit"] },
      { category: "Shades of blue", difficulty: 2, words: ["Navy", "Cobalt", "Azure", "Teal"] },
      { category: "Big cats", difficulty: 2, words: ["Tiger", "Jaguar", "Leopard", "Cougar"] },
      { category: "Car brands (also cats / colors)", difficulty: 4, words: ["Jaguar", "Cobalt", "Lime", "Tiger"] },
    ],
  },
  {
    groups: [
      { category: "Planets", difficulty: 1, words: ["Mars", "Venus", "Mercury", "Saturn"] },
      { category: "Roman gods", difficulty: 3, words: ["Jupiter", "Neptune", "Pluto", "Apollo"] },
      { category: "Cars", difficulty: 3, words: ["Mustang", "Civic", "Corolla", "Beetle"] },
      { category: "Insects", difficulty: 2, words: ["Cricket", "Beetle", "Ant", "Wasp"] },
    ],
  },
  {
    groups: [
      { category: "Pasta shapes", difficulty: 1, words: ["Penne", "Fusilli", "Rigatoni", "Farfalle"] },
      { category: "Sushi types", difficulty: 2, words: ["Maki", "Nigiri", "Sashimi", "Temaki"] },
      { category: "Bread varieties", difficulty: 2, words: ["Baguette", "Sourdough", "Ciabatta", "Brioche"] },
      { category: "Cheeses", difficulty: 3, words: ["Brie", "Cheddar", "Gouda", "Feta"] },
    ],
  },
  {
    groups: [
      { category: "Chess pieces", difficulty: 1, words: ["King", "Queen", "Bishop", "Knight"] },
      { category: "Card suits & ranks", difficulty: 2, words: ["Ace", "Jack", "Joker", "Spade"] },
      { category: "Royalty terms", difficulty: 3, words: ["Duke", "Earl", "Baron", "Count"] },
      { category: "Famous Elvises / nicknames", difficulty: 4, words: ["Presley", "Costello", "Stojko", "Duran"] },
    ],
  },
  {
    groups: [
      { category: "Things with rings", difficulty: 2, words: ["Saturn", "Tree", "Boxer", "Phone"] },
      { category: "Olympic sports", difficulty: 1, words: ["Fencing", "Judo", "Archery", "Diving"] },
      { category: "Currencies", difficulty: 2, words: ["Yen", "Peso", "Rupee", "Krona"] },
      { category: "Bird parts", difficulty: 3, words: ["Beak", "Talon", "Crest", "Plume"] },
    ],
  },
  {
    groups: [
      { category: "Greek letters", difficulty: 1, words: ["Alpha", "Beta", "Gamma", "Delta"] },
      { category: "NATO phonetic", difficulty: 2, words: ["Tango", "Echo", "Foxtrot", "Whiskey"] },
      { category: "Dances", difficulty: 2, words: ["Salsa", "Waltz", "Rumba", "Jive"] },
      { category: "Frat-house words / Greek-sounding", difficulty: 4, words: ["Sigma", "Omega", "Kappa", "Phi"] },
    ],
  },
];

export const DIFFICULTY_COLOR: Record<number, string> = {
  1: "var(--highlighter)",
  2: "var(--toner)",
  3: "var(--manila)",
  4: "var(--stamp)",
};

export function randomBoard(): Board {
  return BOARDS[Math.floor(Math.random() * BOARDS.length)];
}

export function tilesFromBoard(b: Board): string[] {
  const all = b.groups.flatMap((g) => g.words);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
}

export function findGroup(b: Board, words: string[]): Group | null {
  for (const g of b.groups) {
    const setG = new Set(g.words);
    if (words.length === 4 && words.every((w) => setG.has(w))) return g;
  }
  return null;
}
