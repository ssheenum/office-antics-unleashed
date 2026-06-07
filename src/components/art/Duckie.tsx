// Parameterised duck illustration driven by traits.
import type { DuckTraits } from "@/lib/puzzles/ducks";
import { COLOR_HEX } from "@/lib/puzzles/ducks";

const INK = "#1f2933";
const CREAM = "#fdf6e3";
const CORAL = "#ff7a59";

export function Duckie({ traits, scale = 1 }: { traits: DuckTraits; scale?: number }) {
  const body = COLOR_HEX[traits.color];
  const w = 96 * scale;
  const h = 80 * scale;
  const sizeMul = traits.size === "small" ? 0.8 : 1.1;
  // flip via transform
  return (
    <svg width={w} height={h} viewBox="0 0 96 80" style={{ overflow: "visible" }}>
      <g transform={`translate(48 50) scale(${(traits.dir === "left" ? -1 : 1) * sizeMul} ${sizeMul}) translate(-48 -50)`}>
        {/* body */}
        <ellipse cx="40" cy="50" rx="26" ry="14" fill={body} stroke={INK} strokeWidth="2.5" />
        {/* wing */}
        <path d="M30 44 q 10 -8 22 0" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* head */}
        <circle cx="62" cy="30" r="14" fill={body} stroke={INK} strokeWidth="2.5" />
        {/* beak */}
        <path d="M74 32 L86 30 L78 38 Z" fill={CORAL} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        {/* eye + mood */}
        <Eye mood={traits.mood} />
        {/* held object */}
        <HeldObject obj={traits.object} />
        {/* hat */}
        <Hat hat={traits.hat} />
      </g>
    </svg>
  );
}

function Eye({ mood }: { mood: DuckTraits["mood"] }) {
  switch (mood) {
    case "happy":
      return (
        <g>
          <circle cx="66" cy="28" r="1.9" fill={INK} />
          <circle cx="66.6" cy="27.4" r="0.5" fill={CREAM} />
        </g>
      );
    case "sleepy":
      return <path d="M63 28 q 3 2 6 0" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />;
    case "angry":
      return (
        <g>
          <path d="M62 25 L 70 28" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          <circle cx="66" cy="29" r="2" fill={INK} />
        </g>
      );
    case "surprised":
      return (
        <g>
          <circle cx="66" cy="28" r="3" fill={CREAM} stroke={INK} strokeWidth="1.4" />
          <circle cx="66" cy="28" r="1.2" fill={INK} />
        </g>
      );
  }
}

function Hat({ hat }: { hat: DuckTraits["hat"] }) {
  if (hat === "none") return null;
  if (hat === "beret") {
    return (
      <g>
        <ellipse cx="60" cy="16" rx="13" ry="4" fill="#8b3a3a" stroke={INK} strokeWidth="2" />
        <circle cx="68" cy="12" r="2" fill="#8b3a3a" stroke={INK} strokeWidth="1.6" />
      </g>
    );
  }
  if (hat === "straw") {
    return (
      <g>
        <ellipse cx="60" cy="18" rx="18" ry="3.5" fill="#e8c576" stroke={INK} strokeWidth="2" />
        <ellipse cx="60" cy="12" rx="9" ry="5" fill="#e8c576" stroke={INK} strokeWidth="2" />
        <path d="M52 12 q 8 -3 16 0" stroke="#a87c2e" strokeWidth="1.4" fill="none" />
      </g>
    );
  }
  // party
  return (
    <g>
      <path d="M52 18 L 60 -4 L 70 18 Z" fill="#06aed5" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="60" cy="-4" r="2.4" fill="#ffd166" stroke={INK} strokeWidth="1.4" />
      <circle cx="56" cy="8" r="1.4" fill={CREAM} />
      <circle cx="65" cy="12" r="1.4" fill={CREAM} />
    </g>
  );
}

function HeldObject({ obj }: { obj: DuckTraits["object"] }) {
  if (obj === "none") return null;
  if (obj === "flower") {
    return (
      <g transform="translate(14 50)">
        <line x1="0" y1="14" x2="0" y2="0" stroke="#1ba884" strokeWidth="2" />
        <circle cx="0" cy="0" r="4" fill="#ffadc6" stroke={INK} strokeWidth="1.5" />
        <circle cx="0" cy="0" r="1.4" fill="#ffd166" />
      </g>
    );
  }
  if (obj === "fish") {
    return (
      <g transform="translate(8 56)">
        <ellipse cx="6" cy="0" rx="6" ry="3" fill="#7fd6ec" stroke={INK} strokeWidth="1.5" />
        <path d="M12 0 L 16 -3 L 16 3 Z" fill="#7fd6ec" stroke={INK} strokeWidth="1.5" />
        <circle cx="3" cy="-0.5" r="0.7" fill={INK} />
      </g>
    );
  }
  // umbrella
  return (
    <g transform="translate(14 50)">
      <line x1="0" y1="14" x2="0" y2="-2" stroke={INK} strokeWidth="2" />
      <path d="M-8 -2 q 8 -8 16 0 z" fill={CORAL} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M0 14 q 3 2 5 0" stroke={INK} strokeWidth="1.6" fill="none" />
    </g>
  );
}
