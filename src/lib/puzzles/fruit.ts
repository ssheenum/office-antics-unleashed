// Low-Hanging Fruit — pick subset of numbered fruits satisfying a target, minimizing reach
export interface Fruit {
  id: number;
  value: number;
  row: number; // 0 = lowest, 3 = highest
  col: number;
}

export type Target =
  | { kind: "sum"; n: number; size: number }
  | { kind: "product-div"; div: number; size: number }
  | { kind: "all-prime"; size: number }
  | { kind: "all-even"; size: number };

export interface Puzzle {
  fruits: Fruit[];
  target: Target;
}

const PRIMES = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23]);
export const isPrime = (n: number) => PRIMES.has(n);

export function describeTarget(t: Target): string {
  switch (t.kind) {
    case "sum":
      return `Pick ${t.size} fruits that sum to ${t.n}.`;
    case "product-div":
      return `Pick ${t.size} fruits whose product is divisible by ${t.div}.`;
    case "all-prime":
      return `Pick ${t.size} fruits that are all prime numbers.`;
    case "all-even":
      return `Pick ${t.size} fruits that are all even numbers.`;
  }
}

export function check(t: Target, fruits: Fruit[]): boolean {
  if (fruits.length !== t.size) return false;
  switch (t.kind) {
    case "sum":
      return fruits.reduce((s, f) => s + f.value, 0) === t.n;
    case "product-div":
      return fruits.reduce((p, f) => p * f.value, 1) % t.div === 0;
    case "all-prime":
      return fruits.every((f) => isPrime(f.value));
    case "all-even":
      return fruits.every((f) => f.value % 2 === 0);
  }
}

export function reachCost(fruits: Fruit[]): number {
  // higher rows cost more
  return fruits.reduce((s, f) => s + (f.row + 1), 0);
}

export function generate(level: number = 1): Puzzle {
  // Difficulty: size 3 → 5, value range widens, kinds unlock with level
  const size = Math.min(5, 3 + Math.floor((level - 1) / 2));
  const maxVal = 9 + Math.min(15, level * 2);
  const fruits: Fruit[] = [];
  let id = 0;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const v = 1 + Math.floor(Math.random() * maxVal);
      fruits.push({ id: id++, value: v, row, col });
    }
  }
  const kinds: Target["kind"][] =
    level <= 1 ? ["sum", "all-even"] :
    level <= 3 ? ["sum", "all-even", "all-prime"] :
    ["sum", "product-div", "all-prime", "all-even"];
  const kind = kinds[Math.floor(Math.random() * kinds.length)];
  let target: Target;
  if (kind === "sum") {
    const maxRow = Math.min(3, 1 + Math.floor(level / 3));
    const low = fruits.filter((f) => f.row <= maxRow).sort(() => Math.random() - 0.5).slice(0, size);
    const n = low.reduce((s, f) => s + f.value, 0);
    target = { kind: "sum", n, size };
  } else if (kind === "product-div") {
    const divs = level >= 5 ? [2, 3, 4, 5, 6, 7, 8, 9] : [2, 3, 4, 5, 6];
    target = { kind: "product-div", div: divs[Math.floor(Math.random() * divs.length)], size };
  } else if (kind === "all-prime") {
    const primeVals = [2, 3, 5, 7, 11, 13];
    let count = fruits.filter((f) => f.row <= 2 && isPrime(f.value)).length;
    if (count < size) {
      const lows = fruits.filter((f) => f.row <= 1);
      for (let i = 0; count < size && i < lows.length; i++) {
        lows[i].value = primeVals[Math.floor(Math.random() * primeVals.length)];
        count++;
      }
    }
    target = { kind: "all-prime", size };
  } else {
    let count = fruits.filter((f) => f.row <= 2 && f.value % 2 === 0).length;
    if (count < size) {
      const lows = fruits.filter((f) => f.row <= 1);
      for (let i = 0; count < size && i < lows.length; i++) {
        lows[i].value = 2 + 2 * Math.floor(Math.random() * 9);
        count++;
      }
    }
    target = { kind: "all-even", size };
  }
  return { fruits, target };
}
