const CURRENT_KEY = "touch-grass:current-user";
const USERS_KEY = "touch-grass:users";

export const QUIRKY_USERNAMES = [
  "SynergySlayer",
  "OOO_Forever",
  "MidMeetingMute",
  "SlackLurker",
  "PivotTablePirate",
  "InboxZeroHero",
  "CircleBackChad",
  "EOD_Goblin",
  "ScopeCreepKing",
  "OffsiteOracle",
];

export function getCurrentUser(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENT_KEY);
}

export function setCurrentUser(name: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENT_KEY, name);
  const users = listUsers();
  if (!users.includes(name)) {
    users.push(name);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}

export function clearCurrentUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CURRENT_KEY);
}

export function listUsers(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function sanitizeUsername(input: string): string {
  return input.trim().replace(/\s+/g, "").slice(0, 20);
}
