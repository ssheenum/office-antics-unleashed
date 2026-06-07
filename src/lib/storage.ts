export type SkillKey = "logic" | "memory" | "spatial";
export type GameKey = "ducks" | "deepdive" | "fruit";

export interface GameState {
  bestScores: Record<GameKey, number>;
  skillXp: Record<SkillKey, number>;
  streak: { count: number; lastDay: string | null };
  achievements: string[];
  totalPlays: Record<GameKey, number>;
  dailyDone: { day: string; games: GameKey[] };
}

const KEY = "cubicle-quest:v2";

const DEFAULT_STATE: GameState = {
  bestScores: { ducks: 0, deepdive: 0, fruit: 0 },
  skillXp: { logic: 0, memory: 0, spatial: 0 },
  streak: { count: 0, lastDay: null },
  achievements: [],
  totalPlays: { ducks: 0, deepdive: 0, fruit: 0 },
  dailyDone: { day: "", games: [] },
};

export function loadState(): GameState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      bestScores: { ...DEFAULT_STATE.bestScores, ...(parsed.bestScores ?? {}) },
      skillXp: { ...DEFAULT_STATE.skillXp, ...(parsed.skillXp ?? {}) },
      totalPlays: { ...DEFAULT_STATE.totalPlays, ...(parsed.totalPlays ?? {}) },
      dailyDone: parsed.dailyDone ?? DEFAULT_STATE.dailyDone,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: GameState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export const GAME_TO_SKILL: Record<GameKey, SkillKey> = {
  ducks: "memory",
  deepdive: "logic",
  fruit: "spatial",
};

export const GAME_LABEL: Record<GameKey, string> = {
  ducks: "Ducks in a Row",
  deepdive: "Deep Dive",
  fruit: "Low-Hanging Fruit",
};

export const SKILL_LABEL: Record<SkillKey, string> = {
  logic: "Logic",
  memory: "Memory",
  spatial: "Reflex",
};

export const GAME_KEYS: GameKey[] = ["ducks", "deepdive", "fruit"];

export function recordRound(game: GameKey, score: number, xpGain: number): GameState {
  const s = loadState();
  s.bestScores[game] = Math.max(s.bestScores[game], score);
  s.totalPlays[game] = (s.totalPlays[game] ?? 0) + 1;
  s.skillXp[GAME_TO_SKILL[game]] = (s.skillXp[GAME_TO_SKILL[game]] ?? 0) + xpGain;

  const today = todayKey();
  if (s.dailyDone.day !== today) s.dailyDone = { day: today, games: [] };
  if (!s.dailyDone.games.includes(game)) s.dailyDone.games.push(game);

  if (s.dailyDone.games.length === GAME_KEYS.length) {
    if (s.streak.lastDay !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      s.streak.count = s.streak.lastDay === yesterday ? s.streak.count + 1 : 1;
      s.streak.lastDay = today;
    }
  }

  const earn = (id: string) => { if (!s.achievements.includes(id)) s.achievements.push(id); };
  if (s.bestScores.ducks >= 800) earn("All Aligned");
  if (s.bestScores.deepdive >= 600) earn("Koi Whisperer");
  if (s.bestScores.fruit >= 500) earn("Basket Wizard");
  if (s.streak.count >= 3) earn("Touched Grass");

  saveState(s);
  return s;
}
