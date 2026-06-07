// Tiny SVG illustrations for the underwater grid tiles.
import type { PropKind } from "@/lib/puzzles/deepdive";

const INK = "#1f2933";
const CREAM = "#fdf6e3";

export function PropSprite({ kind, size = 56 }: { kind: PropKind; size?: number }) {
  switch (kind) {
    case "redCoral":
      return (
        <svg width={size} height={size} viewBox="0 0 56 56">
          <path d="M28 50 L 28 22 M28 30 L 18 18 M28 30 L 38 18 M28 24 L 22 12 M28 24 L 34 12"
                stroke="#ef4444" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d="M16 50 q 12 -4 24 0" stroke={INK} strokeWidth="2" fill="none" />
        </svg>
      );
    case "blueCoral":
      return (
        <svg width={size} height={size} viewBox="0 0 56 56">
          <path d="M28 50 L 28 22 M28 30 L 18 18 M28 30 L 38 18 M28 24 L 22 12 M28 24 L 34 12"
                stroke="#3b82f6" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d="M16 50 q 12 -4 24 0" stroke={INK} strokeWidth="2" fill="none" />
        </svg>
      );
    case "jellyfish":
      return (
        <svg width={size} height={size} viewBox="0 0 56 56">
          <path d="M10 26 q 18 -22 36 0 v 6 H 10 Z" fill="#e0a3ff" stroke={INK} strokeWidth="2" />
          <path d="M14 32 q 0 10 -4 16 M22 32 q 0 12 -2 18 M30 32 q 0 12 2 18 M42 32 q 0 10 4 16"
                stroke="#c986e8" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="22" cy="22" r="1.6" fill={INK} />
          <circle cx="34" cy="22" r="1.6" fill={INK} />
        </svg>
      );
    case "turtle":
      return (
        <svg width={size} height={size} viewBox="0 0 56 56">
          <ellipse cx="28" cy="32" rx="18" ry="13" fill="#2dd4a8" stroke={INK} strokeWidth="2.5" />
          <path d="M16 30 q 12 -8 24 0" stroke="#1ba884" strokeWidth="1.8" fill="none" />
          <path d="M18 36 q 10 6 20 0" stroke="#1ba884" strokeWidth="1.8" fill="none" />
          <circle cx="46" cy="28" r="5" fill="#2dd4a8" stroke={INK} strokeWidth="2" />
          <circle cx="48" cy="27" r="1.2" fill={INK} />
          <ellipse cx="14" cy="42" rx="3" ry="2" fill="#2dd4a8" stroke={INK} strokeWidth="1.6" />
          <ellipse cx="42" cy="44" rx="3" ry="2" fill="#2dd4a8" stroke={INK} strokeWidth="1.6" />
        </svg>
      );
    case "anchor":
      return (
        <svg width={size} height={size} viewBox="0 0 56 56">
          <circle cx="28" cy="12" r="5" fill="none" stroke={INK} strokeWidth="3" />
          <line x1="28" y1="17" x2="28" y2="44" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          <line x1="20" y1="22" x2="36" y2="22" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d="M12 38 q 4 10 16 10 q 12 0 16 -10" stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </svg>
      );
    case "seaweed":
      return (
        <svg width={size} height={size} viewBox="0 0 56 56">
          <path d="M16 50 q -6 -10 0 -18 q 6 -8 0 -18 q -3 -6 2 -10"
                stroke="#1ba884" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M34 50 q 6 -10 0 -18 q -6 -8 0 -18 q 3 -6 -2 -10"
                stroke="#2dd4a8" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "bubble":
      return (
        <svg width={size} height={size} viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="14" fill="rgba(255,255,255,0.75)" stroke={INK} strokeWidth="2.2" />
          <circle cx="22" cy="22" r="3" fill={CREAM} opacity="0.9" />
        </svg>
      );
    case "shell":
      return (
        <svg width={size} height={size} viewBox="0 0 56 56">
          <path d="M8 40 q 20 -36 40 0 z" fill="#ffd6c2" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M28 40 L 28 8 M18 36 L 24 10 M38 36 L 32 10 M14 38 L 21 12 M42 38 L 35 12"
                stroke="#d49a85" strokeWidth="1.6" fill="none" />
        </svg>
      );
  }
}

export function TreasureSprite({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56">
      <rect x="8" y="24" width="40" height="22" rx="3" fill="#8b5a2b" stroke={INK} strokeWidth="2.5" />
      <path d="M8 24 q 20 -16 40 0 v 6 H 8 Z" fill="#a06a31" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="24" y="30" width="8" height="8" fill="#ffd166" stroke={INK} strokeWidth="2" />
      <circle cx="28" cy="34" r="1.4" fill={INK} />
      <circle cx="14" cy="16" r="3" fill="#fff" stroke={INK} strokeWidth="1.6" />
      <circle cx="44" cy="14" r="2.4" fill="#fff" stroke={INK} strokeWidth="1.4" />
    </svg>
  );
}
