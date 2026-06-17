// Minimal flat vector garden sprites — thin black line art, limited palette.
import type { PropKind } from "@/lib/puzzles/deepdive";

const INK = "#1f2933";

// Note: PropKind names are legacy; visuals & labels are garden-themed now.
//   redCoral   → red flower (poppy)
//   blueCoral  → blue flower (bellflower)
//   jellyfish  → butterfly
//   turtle     → snail
//   anchor     → watering can
//   seaweed    → fern
//   bubble     → pebble
//   shell      → mushroom

export function PropSprite({ kind, size = 56 }: { kind: PropKind; size?: number }) {
  switch (kind) {
    case "redCoral": // red poppy
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <path d="M32 56 L32 36" stroke="#2f6d2a" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M28 48 q -6 -3 -6 -9" stroke="#2f6d2a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="32" cy="26" r="12" fill="#e94e3a" stroke={INK} strokeWidth="2" />
          <circle cx="26" cy="22" r="5" fill="#c63a2a" stroke={INK} strokeWidth="1.5" />
          <circle cx="38" cy="24" r="4" fill="#c63a2a" stroke={INK} strokeWidth="1.5" />
          <circle cx="32" cy="26" r="3" fill="#1f2933" />
        </svg>
      );
    case "blueCoral": // bellflower
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <path d="M32 56 L32 28" stroke="#2f6d2a" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M22 30 L32 18 L42 30 Z" fill="#3a6ec7" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M26 28 Q 32 34 38 28" stroke={INK} strokeWidth="1.6" fill="none" />
          <circle cx="32" cy="20" r="1.8" fill="#fff4c2" stroke={INK} strokeWidth="1" />
        </svg>
      );
    case "jellyfish": // butterfly
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <path d="M32 18 q -14 -10 -20 0 q -4 12 8 18 q 8 4 12 -4 z" fill="#e8a23a" stroke={INK} strokeWidth="2" />
          <path d="M32 18 q 14 -10 20 0 q 4 12 -8 18 q -8 4 -12 -4 z" fill="#e8a23a" stroke={INK} strokeWidth="2" />
          <circle cx="20" cy="22" r="2" fill={INK} />
          <circle cx="44" cy="22" r="2" fill={INK} />
          <line x1="32" y1="14" x2="32" y2="44" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M32 14 q -3 -4 -6 -3 M32 14 q 3 -4 6 -3" stroke={INK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "turtle": // snail
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <path d="M10 48 L52 48 q 4 0 4 -4 q 0 -6 -8 -6 L14 38" fill="#e8c07a" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="26" cy="32" r="14" fill="#c47a3a" stroke={INK} strokeWidth="2" />
          <circle cx="26" cy="32" r="9" fill="none" stroke={INK} strokeWidth="1.8" />
          <circle cx="26" cy="32" r="4.5" fill="none" stroke={INK} strokeWidth="1.6" />
          <path d="M50 42 L52 32 M54 42 L57 32" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          <circle cx="52" cy="30" r="1.6" fill={INK} />
          <circle cx="57" cy="30" r="1.6" fill={INK} />
        </svg>
      );
    case "anchor": // watering can
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <path d="M14 22 L48 22 L46 50 L18 50 Z" fill="#3a6ec7" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M48 26 L58 18 L60 22 L50 32 Z" fill="#3a6ec7" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M20 22 q 12 -10 24 0" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          <circle cx="58" cy="16" r="1.6" fill="#a9d2ff" stroke={INK} strokeWidth="1" />
          <circle cx="56" cy="13" r="1.4" fill="#a9d2ff" stroke={INK} strokeWidth="1" />
        </svg>
      );
    case "seaweed": // fern frond
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <path d="M32 58 Q 30 36 32 12" stroke="#2f6d2a" strokeWidth="3" fill="none" strokeLinecap="round" />
          {[
            [50, -25], [44, -10], [38, 5], [32, 18], [26, 30],
          ].map(([y, off], i) => (
            <g key={i}>
              <path d={`M32 ${y} q -14 ${off} -16 ${off + 6}`} stroke="#3fb786" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d={`M32 ${y} q 14 ${off} 16 ${off + 6}`} stroke="#3fb786" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>
          ))}
        </svg>
      );
    case "bubble": // pebble
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <path d="M12 40 Q 14 22 32 20 Q 52 22 52 38 Q 50 50 32 50 Q 14 50 12 40 Z" fill="#cbd1d8" stroke={INK} strokeWidth="2" />
          <path d="M20 32 q 6 -4 14 -2" stroke={INK} strokeWidth="1.4" fill="none" opacity="0.4" />
        </svg>
      );
    case "shell": // mushroom
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <path d="M10 36 Q 12 14 32 14 Q 52 14 54 36 Z" fill="#e94e3a" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="22" cy="26" r="3" fill="#fbeed8" stroke={INK} strokeWidth="1.4" />
          <circle cx="36" cy="22" r="2.4" fill="#fbeed8" stroke={INK} strokeWidth="1.4" />
          <circle cx="44" cy="30" r="2" fill="#fbeed8" stroke={INK} strokeWidth="1.4" />
          <path d="M22 36 L 22 52 q 0 4 10 4 q 10 0 10 -4 L 42 36 Z" fill="#fbeed8" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
  }
}

export function TreasureSprite({ size = 56 }: { size?: number }) {
  // Watering can with a sparkly drop — celebratory garden version of "treasure"
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <path d="M14 50 L 50 50 L 44 28 L 20 28 Z" fill="#e8a23a" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <ellipse cx="32" cy="28" rx="14" ry="4" fill="#f5cf6d" stroke={INK} strokeWidth="2" />
      <circle cx="32" cy="18" r="6" fill="#fff4c2" stroke={INK} strokeWidth="2" />
      <path d="M32 18 L 32 8 M26 12 L 24 6 M38 12 L 40 6" stroke="#e9b13d" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
