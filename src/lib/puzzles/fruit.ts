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

export function generate(): Puzzle {
  // 4 rows x 4 cols grid
  const fruits: Fruit[] = [];
  let id = 0;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const v = 1 + Math.floor(Math.random() * 19);
      fruits.push({ id: id++, value: v, row, col });
    }
  }
  // pick target type
  const kinds: Target["kind"][] = ["sum", "product-div", "all-prime", "all-even"];
  const kind = kinds[Math.floor(Math.random() * kinds.length)];
  let target: Target;
  const size = 3;
  if (kind === "sum") {
    // pick 3 random low-row fruits to be a guaranteed solution
    const low = fruits.filter((f) => f.row <= 1).sort(() => Math.random() - 0.5).slice(0, 3);
    const n = low.reduce((s, f) => s + f.value, 0);
    target = { kind: "sum", n, size };
  } else if (kind === "product-div") {
    target = { kind: "product-div", div: [2, 3, 4, 5, 6][Math.floor(Math.random() * 5)], size };
  } else if (kind === "all-prime") {
    // ensure at least 3 primes exist in lower rows; if not, plant some
    const primeVals = [2, 3, 5, 7, 11, 13];
    let count = fruits.filter((f) => f.row <= 2 && isPrime(f.value)).length;
    if (count < 3) {
      const lows = fruits.filter((f) => f.row <= 1);
      for (let i = 0; count < 3 && i < lows.length; i++) {
        lows[i].value = primeVals[Math.floor(Math.random() * primeVals.length)];
        count++;
      }
    }
    target = { kind: "all-prime", size };
  } else {
    let count = fruits.filter((f) => f.row <= 2 && f.value % 2 === 0).length;
    if (count < 3) {
      const lows = fruits.filter((f) => f.row <= 1);
      for (let i = 0; count < 3 && i < lows.length; i++) {
        lows[i].value = 2 + 2 * Math.floor(Math.random() * 9);
        count++;
      }
    }
    target = { kind: "all-even", size };
  }
  return { fruits, target };
}
