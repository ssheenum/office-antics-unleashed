// Flat vector under-the-sea sprites for the Deep Dive puzzle.
import type { PropKind } from "@/lib/puzzles/deepdive";

const INK = "#1f2933";

export function PropSprite({ kind, size = 56 }: { kind: PropKind; size?: number }) {
  switch (kind) {
    case "redCoral":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <path d="M32 56 L 32 36 M32 44 q -6 -2 -8 -10 M32 40 q 6 -3 10 -10 M32 36 q -4 -3 -4 -10 M32 38 q 5 -2 8 -8"
            stroke="#e94e3a" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M32 56 L 32 36 M32 44 q -6 -2 -8 -10 M32 40 q 6 -3 10 -10 M32 36 q -4 -3 -4 -10"
            stroke={INK} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
          <ellipse cx="32" cy="58" rx="14" ry="3" fill="#e8c07a" stroke={INK} strokeWidth="1.5" />
        </svg>
      );
    case "blueCoral":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <path d="M32 56 L 32 30 M28 44 q -8 -4 -10 -14 M36 44 q 8 -4 10 -14 M32 30 q -3 -4 -2 -12 M32 30 q 4 -3 6 -10"
            stroke="#3a6ec7" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <ellipse cx="32" cy="58" rx="14" ry="3" fill="#e8c07a" stroke={INK} strokeWidth="1.5" />
        </svg>
      );
    case "jellyfish":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <path d="M12 28 Q 14 12 32 12 Q 50 12 52 28 Q 52 34 48 34 L 16 34 Q 12 34 12 28 Z"
            fill="#f3a6d6" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M12 32 q 3 4 6 0 q 3 4 6 0 q 3 4 6 0 q 3 4 6 0 q 3 4 6 0 q 3 4 6 0"
            stroke={INK} strokeWidth="1.6" fill="none" />
          <path d="M18 34 q -2 12 -6 18 M28 34 q -1 14 -3 22 M36 34 q 1 14 3 22 M46 34 q 2 12 6 18"
            stroke="#f3a6d6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="24" cy="22" r="2" fill={INK} />
          <circle cx="40" cy="22" r="2" fill={INK} />
        </svg>
      );
    case "turtle":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <ellipse cx="32" cy="36" rx="20" ry="14" fill="#3fb786" stroke={INK} strokeWidth="2" />
          <path d="M32 24 q -6 4 -6 12 q 0 8 6 12 q 6 -4 6 -12 q 0 -8 -6 -12 z M14 36 q 4 -3 8 0 M42 36 q 4 -3 8 0"
            stroke={INK} strokeWidth="1.6" fill="none" />
          <circle cx="50" cy="32" r="5" fill="#3fb786" stroke={INK} strokeWidth="2" />
          <circle cx="52" cy="31" r="1.4" fill={INK} />
          <path d="M16 48 q -2 2 -4 0 M48 48 q 2 2 4 0 M22 50 q 0 3 -2 4 M42 50 q 0 3 2 4"
            stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "anchor":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <circle cx="32" cy="14" r="6" fill="none" stroke="#5a626d" strokeWidth="3" />
          <path d="M32 20 L 32 52 M20 44 q 12 12 24 0 M16 36 L 48 36"
            stroke="#5a626d" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M16 36 l -4 -2 M48 36 l 4 -2" stroke="#5a626d" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case "seaweed":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <path d="M22 56 q -4 -10 2 -20 q -6 -10 2 -20 q -4 -8 4 -10"
            stroke="#2f8a4a" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M40 56 q 4 -10 -2 -20 q 6 -10 -2 -20 q 4 -8 -4 -10"
            stroke="#3fb786" strokeWidth="4" fill="none" strokeLinecap="round" />
          <ellipse cx="32" cy="58" rx="14" ry="3" fill="#e8c07a" stroke={INK} strokeWidth="1.5" />
        </svg>
      );
    case "bubble":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="18" fill="#a9e3ff" stroke={INK} strokeWidth="2" opacity="0.85" />
          <ellipse cx="24" cy="24" rx="5" ry="3.5" fill="white" opacity="0.85" />
          <circle cx="48" cy="46" r="4" fill="#a9e3ff" stroke={INK} strokeWidth="1.5" opacity="0.85" />
        </svg>
      );
    case "shell":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <path d="M10 44 Q 12 16 32 12 Q 52 16 54 44 Z" fill="#ffc4b8" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M32 12 L 32 44 M32 12 q -10 14 -22 32 M32 12 q 10 14 22 32 M32 12 q -5 16 -12 32 M32 12 q 5 16 12 32"
            stroke={INK} strokeWidth="1.5" fill="none" opacity="0.55" />
          <ellipse cx="32" cy="44" rx="22" ry="2.5" fill="#e8c07a" stroke={INK} strokeWidth="1.5" />
        </svg>
      );
  }
}

export function TreasureSprite({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      {/* treasure chest */}
      <path d="M8 28 q 0 -10 8 -10 H 48 q 8 0 8 10 V 30 H 8 Z" fill="#a06a3a" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <rect x="8" y="30" width="48" height="22" rx="2" fill="#c98a52" stroke={INK} strokeWidth="2" />
      <path d="M8 36 H 56 M8 44 H 56" stroke={INK} strokeWidth="1.2" opacity="0.45" />
      <rect x="28" y="32" width="8" height="10" rx="1.5" fill="#ffd166" stroke={INK} strokeWidth="2" />
      <circle cx="32" cy="37" r="1.5" fill={INK} />
      {/* sparkle */}
      <path d="M48 14 L 50 18 L 54 20 L 50 22 L 48 26 L 46 22 L 42 20 L 46 18 Z" fill="#ffd166" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
