// Cute underwater sprites with soft gradients and chunky line art.
import type { PropKind } from "@/lib/puzzles/deepdive";

const INK = "#1f2933";
const CREAM = "#fffaf0";

export function PropSprite({ kind, size = 56 }: { kind: PropKind; size?: number }) {
  switch (kind) {
    case "redCoral":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <defs>
            <linearGradient id="rcor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ff6b6b" />
              <stop offset="1" stopColor="#c8344c" />
            </linearGradient>
          </defs>
          <path d="M32 56 L32 22 M32 30 L20 16 M32 30 L44 16 M32 22 L24 8 M32 22 L40 8 M20 16 L14 8 M44 16 L50 8"
                stroke="url(#rcor)" strokeWidth="6" strokeLinecap="round" fill="none" />
          <circle cx="32" cy="22" r="3" fill="#ff8da8" />
          <circle cx="20" cy="16" r="2.4" fill="#ff8da8" />
          <circle cx="44" cy="16" r="2.4" fill="#ff8da8" />
          <ellipse cx="32" cy="58" rx="20" ry="3" fill={INK} opacity="0.18" />
        </svg>
      );
    case "blueCoral":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <defs>
            <linearGradient id="bcor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#6cb6ff" />
              <stop offset="1" stopColor="#2855c4" />
            </linearGradient>
          </defs>
          <path d="M32 56 L32 22 M32 30 L20 16 M32 30 L44 16 M32 22 L24 8 M32 22 L40 8 M20 16 L14 8 M44 16 L50 8"
                stroke="url(#bcor)" strokeWidth="6" strokeLinecap="round" fill="none" />
          <circle cx="32" cy="22" r="3" fill="#a9d2ff" />
          <circle cx="20" cy="16" r="2.4" fill="#a9d2ff" />
          <circle cx="44" cy="16" r="2.4" fill="#a9d2ff" />
          <ellipse cx="32" cy="58" rx="20" ry="3" fill={INK} opacity="0.18" />
        </svg>
      );
    case "jellyfish":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <defs>
            <radialGradient id="jelly" cx="50%" cy="40%" r="60%">
              <stop offset="0" stopColor="#fbe1ff" />
              <stop offset="0.6" stopColor="#e0a3ff" />
              <stop offset="1" stopColor="#9b5fc0" />
            </radialGradient>
          </defs>
          <path d="M8 30 q 24 -28 48 0 v 8 H 8 Z" fill="url(#jelly)" stroke={INK} strokeWidth="2.4" />
          <ellipse cx="22" cy="22" rx="5" ry="2.5" fill={CREAM} opacity="0.7" />
          <path d="M14 38 q -2 12 -6 18 M22 38 q -1 14 -3 20 M32 38 q 0 14 0 22 M42 38 q 1 14 3 20 M50 38 q 2 12 6 18"
                stroke="#b97cdb" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <circle cx="24" cy="26" r="1.8" fill={INK} />
          <circle cx="40" cy="26" r="1.8" fill={INK} />
          <path d="M28 32 q 4 3 8 0" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "turtle":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <defs>
            <radialGradient id="shell" cx="35%" cy="35%" r="80%">
              <stop offset="0" stopColor="#7ee3b8" />
              <stop offset="1" stopColor="#1ba884" />
            </radialGradient>
          </defs>
          <ellipse cx="34" cy="60" rx="22" ry="3" fill={INK} opacity="0.18" />
          <ellipse cx="32" cy="36" rx="22" ry="16" fill="url(#shell)" stroke={INK} strokeWidth="2.6" />
          <path d="M14 34 q 18 -10 36 0" stroke="#0e7a5e" strokeWidth="2" fill="none" />
          <path d="M14 40 q 18 8 36 0" stroke="#0e7a5e" strokeWidth="2" fill="none" />
          <path d="M32 22 L 32 50 M22 24 L 26 48 M42 24 L 38 48" stroke="#0e7a5e" strokeWidth="1.5" fill="none" opacity="0.5" />
          <circle cx="50" cy="30" r="6" fill="#3fb786" stroke={INK} strokeWidth="2.4" />
          <circle cx="52" cy="28" r="1.6" fill={INK} />
          <circle cx="52.6" cy="27.4" r="0.5" fill={CREAM} />
          <path d="M55 31 q 2 0 3 -1" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <ellipse cx="14" cy="46" rx="4" ry="2.4" fill="#3fb786" stroke={INK} strokeWidth="2" />
          <ellipse cx="48" cy="48" rx="4" ry="2.4" fill="#3fb786" stroke={INK} strokeWidth="2" />
        </svg>
      );
    case "anchor":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <defs>
            <linearGradient id="anch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5a6573" />
              <stop offset="1" stopColor="#2a313b" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="12" r="6" fill="none" stroke="url(#anch)" strokeWidth="4" />
          <line x1="32" y1="18" x2="32" y2="48" stroke="url(#anch)" strokeWidth="5" strokeLinecap="round" />
          <line x1="22" y1="24" x2="42" y2="24" stroke="url(#anch)" strokeWidth="4" strokeLinecap="round" />
          <path d="M12 40 q 4 12 20 12 q 16 0 20 -12" stroke="url(#anch)" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M14 38 L 10 36 M50 38 L 54 36" stroke="url(#anch)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="32" cy="12" r="1.5" fill={CREAM} opacity="0.5" />
        </svg>
      );
    case "seaweed":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <defs>
            <linearGradient id="sw1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7ee3b8" />
              <stop offset="1" stopColor="#1ba884" />
            </linearGradient>
          </defs>
          <path d="M18 58 q -8 -12 0 -22 q 8 -10 0 -22 q -4 -6 2 -10"
                stroke="url(#sw1)" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M40 58 q 8 -12 0 -22 q -8 -10 0 -22 q 4 -6 -2 -10"
                stroke="url(#sw1)" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.85" />
          <circle cx="14" cy="20" r="2" fill="#aaf0d8" />
          <circle cx="44" cy="14" r="1.6" fill="#aaf0d8" />
        </svg>
      );
    case "bubble":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <defs>
            <radialGradient id="bub" cx="35%" cy="30%" r="75%">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.5" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="1" stopColor="rgba(180,220,255,0.3)" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="32" r="18" fill="url(#bub)" stroke="#5fb4d4" strokeWidth="2.2" />
          <circle cx="26" cy="24" r="4" fill={CREAM} opacity="0.9" />
          <circle cx="38" cy="38" r="1.8" fill={CREAM} opacity="0.7" />
        </svg>
      );
    case "shell":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <defs>
            <radialGradient id="shl" cx="50%" cy="20%" r="80%">
              <stop offset="0" stopColor="#fff0e6" />
              <stop offset="0.5" stopColor="#ffd0b3" />
              <stop offset="1" stopColor="#c87f5a" />
            </radialGradient>
          </defs>
          <path d="M8 48 q 24 -42 48 0 z" fill="url(#shl)" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M32 48 L 32 8 M22 44 L 26 10 M42 44 L 38 10 M14 46 L 20 12 M50 46 L 44 12"
                stroke="#a86a4a" strokeWidth="1.8" fill="none" />
          <circle cx="32" cy="14" r="2.4" fill="#fff" opacity="0.7" />
          <ellipse cx="32" cy="50" rx="22" ry="2.4" fill={INK} opacity="0.18" />
        </svg>
      );
  }
}

export function TreasureSprite({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <defs>
        <linearGradient id="chst" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c08a4a" />
          <stop offset="1" stopColor="#6a3e1a" />
        </linearGradient>
        <radialGradient id="gld" cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#fff3a8" />
          <stop offset="1" stopColor="#e0a830" />
        </radialGradient>
      </defs>
      <rect x="8" y="28" width="48" height="26" rx="3" fill="url(#chst)" stroke={INK} strokeWidth="2.6" />
      <path d="M8 28 q 24 -18 48 0 v 8 H 8 Z" fill="url(#chst)" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M8 36 q 24 -10 48 0" stroke={INK} strokeWidth="1.5" fill="none" opacity="0.4" />
      <rect x="26" y="34" width="12" height="12" rx="1" fill="url(#gld)" stroke={INK} strokeWidth="2" />
      <circle cx="32" cy="40" r="1.8" fill={INK} />
      {/* sparkles */}
      <g fill="#fff7c2" stroke={INK} strokeWidth="1.2">
        <path d="M14 16 L 16 12 L 18 16 L 22 18 L 18 20 L 16 24 L 14 20 L 10 18 Z" />
        <path d="M50 14 L 51 11 L 52 14 L 55 15 L 52 16 L 51 19 L 50 16 L 47 15 Z" />
      </g>
      <ellipse cx="32" cy="58" rx="24" ry="2.6" fill={INK} opacity="0.22" />
    </svg>
  );
}
