// Cartoon duck illustration driven by traits. Soft gradients + chunky line art.
import type { DuckTraits } from "@/lib/puzzles/ducks";
import { COLOR_HEX } from "@/lib/puzzles/ducks";

const INK = "#1f2933";
const CREAM = "#fffaf0";
const CORAL = "#ff8a3c";
const CORAL_DEEP = "#d96420";

function shade(color: string, amt = 0.85) {
  // crude darker version using color-mix is css-only; pre-baked here
  // For our 6 colors return a hand-tuned darker companion.
  const map: Record<string, string> = {
    "#ffd166": "#e8a93a",
    "#ffadc6": "#e07a98",
    "#7ee3b8": "#3fb786",
    "#7fd6ec": "#3aa3c2",
    "#ff9966": "#d4663a",
    "#c9a8ff": "#9173d8",
  };
  return map[color] ?? color;
  void amt;
}

export function Duckie({ traits, scale = 1 }: { traits: DuckTraits; scale?: number }) {
  const body = COLOR_HEX[traits.color];
  const bodyDark = shade(body);
  const w = 110 * scale;
  const h = 96 * scale;
  const sizeMul = traits.size === "small" ? 0.78 : 1.08;
  const flip = traits.dir === "left" ? -1 : 1;
  const gid = `dk-${traits.id}`;

  return (
    <svg width={w} height={h} viewBox="0 0 110 96" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={`${gid}-body`} cx="35%" cy="35%" r="75%">
          <stop offset="0%" stopColor={CREAM} stopOpacity="0.55" />
          <stop offset="40%" stopColor={body} />
          <stop offset="100%" stopColor={bodyDark} />
        </radialGradient>
        <radialGradient id={`${gid}-head`} cx="30%" cy="30%" r="80%">
          <stop offset="0%" stopColor={CREAM} stopOpacity="0.7" />
          <stop offset="55%" stopColor={body} />
          <stop offset="100%" stopColor={bodyDark} />
        </radialGradient>
      </defs>
      {/* soft ground shadow */}
      <ellipse cx="55" cy="82" rx="30" ry="4" fill={INK} opacity="0.14" />
      <g transform={`translate(55 52) scale(${flip * sizeMul} ${sizeMul}) translate(-55 -52)`}>
        {/* tail */}
        <path d="M22 48 q -10 -4 -12 -12 q 10 0 14 6 z" fill={bodyDark} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        {/* body */}
        <ellipse cx="48" cy="56" rx="30" ry="17" fill={`url(#${gid}-body)`} stroke={INK} strokeWidth="2.6" />
        {/* belly highlight */}
        <ellipse cx="46" cy="62" rx="20" ry="8" fill={CREAM} opacity="0.4" />
        {/* wing */}
        <path d="M34 50 q 14 -10 28 -2 q -2 10 -14 12 q -10 0 -14 -10 z" fill={bodyDark} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M40 53 q 8 -4 16 -1" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.6" />
        {/* head */}
        <circle cx="72" cy="30" r="17" fill={`url(#${gid}-head)`} stroke={INK} strokeWidth="2.6" />
        {/* cheek blush */}
        <ellipse cx="66" cy="36" rx="4" ry="2.2" fill="#ff7eb4" opacity="0.55" />
        {/* beak */}
        <path d="M84 30 q 10 -2 14 4 q -6 6 -14 4 z" fill={CORAL} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M84 34 q 6 1 11 1" stroke={CORAL_DEEP} strokeWidth="1.4" fill="none" />
        {/* eye + mood */}
        <Eye mood={traits.mood} />
        {/* feet */}
        <path d="M44 72 q -1 6 -6 7 q -1 -7 4 -10" fill={CORAL} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M58 72 q -1 6 -6 7 q -1 -7 4 -10" fill={CORAL} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        {/* held object */}
        <HeldObject obj={traits.object} />
        {/* hat */}
        <Hat hat={traits.hat} />
      </g>
    </svg>
  );
}

function Eye({ mood }: { mood: DuckTraits["mood"] }) {
  const cx = 76, cy = 28;
  switch (mood) {
    case "happy":
      return (
        <g>
          <circle cx={cx} cy={cy} r="3.4" fill={INK} />
          <circle cx={cx + 1.1} cy={cy - 1} r="1.1" fill={CREAM} />
          <path d="M70 22 q 4 -3 8 -1" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      );
    case "sleepy":
      return (
        <g>
          <path d={`M${cx - 4} ${cy} q 4 3 8 0`} stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d={`M${cx - 3} ${cy + 4} q 3 1 6 0`} stroke={INK} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
        </g>
      );
    case "angry":
      return (
        <g>
          <path d={`M${cx - 5} ${cy - 4} L ${cx + 5} ${cy - 1}`} stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx={cx} cy={cy + 1} r="3" fill={INK} />
          <circle cx={cx + 1} cy={cy} r="0.9" fill={CREAM} />
        </g>
      );
    case "surprised":
      return (
        <g>
          <circle cx={cx} cy={cy} r="4.2" fill={CREAM} stroke={INK} strokeWidth="1.6" />
          <circle cx={cx} cy={cy} r="2" fill={INK} />
          <circle cx={cx + 0.8} cy={cy - 0.8} r="0.8" fill={CREAM} />
          <path d="M70 21 q 4 -2 8 -1" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </g>
      );
  }
}

function Hat({ hat }: { hat: DuckTraits["hat"] }) {
  if (hat === "none") return null;
  if (hat === "beret") {
    return (
      <g>
        <ellipse cx="70" cy="16" rx="16" ry="5" fill="#b33b3b" stroke={INK} strokeWidth="2.2" />
        <ellipse cx="70" cy="14" rx="14" ry="4" fill="#d35454" />
        <circle cx="80" cy="9" r="2.4" fill="#b33b3b" stroke={INK} strokeWidth="1.6" />
      </g>
    );
  }
  if (hat === "straw") {
    return (
      <g>
        <ellipse cx="70" cy="18" rx="22" ry="4" fill="#e8c576" stroke={INK} strokeWidth="2.2" />
        <ellipse cx="70" cy="11" rx="11" ry="6" fill="#f0d488" stroke={INK} strokeWidth="2.2" />
        <path d="M59 12 q 11 -4 22 0" stroke="#a87c2e" strokeWidth="1.6" fill="none" />
        <path d="M58 18 q 12 4 24 0" stroke="#a87c2e" strokeWidth="1.2" fill="none" opacity="0.6" />
      </g>
    );
  }
  // party
  return (
    <g>
      <path d="M60 20 L 72 -8 L 84 20 Z" fill="#06aed5" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M60 20 L 72 -8 q -2 14 -12 28 z" fill="#0a8aaa" opacity="0.5" />
      <circle cx="72" cy="-9" r="3" fill="#ffd166" stroke={INK} strokeWidth="1.6" />
      <circle cx="65" cy="6" r="1.6" fill={CREAM} />
      <circle cx="78" cy="10" r="1.6" fill={CREAM} />
      <circle cx="70" cy="14" r="1.2" fill="#ffd166" />
    </g>
  );
}

function HeldObject({ obj }: { obj: DuckTraits["object"] }) {
  if (obj === "none") return null;
  if (obj === "flower") {
    return (
      <g transform="translate(20 56)">
        <line x1="0" y1="14" x2="0" y2="-4" stroke="#1ba884" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M0 -4 q 3 -1 4 -4" stroke="#1ba884" strokeWidth="1.6" fill="none" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse key={a} cx="0" cy="-10" rx="3.2" ry="5" fill="#ffadc6" stroke={INK} strokeWidth="1.2"
                   transform={`rotate(${a} 0 -6)`} />
        ))}
        <circle cx="0" cy="-6" r="2.4" fill="#ffd166" stroke={INK} strokeWidth="1.2" />
      </g>
    );
  }
  if (obj === "fish") {
    return (
      <g transform="translate(14 62)">
        <ellipse cx="8" cy="0" rx="8" ry="4" fill="#7fd6ec" stroke={INK} strokeWidth="1.8" />
        <ellipse cx="6" cy="-1" rx="4" ry="1.5" fill={CREAM} opacity="0.6" />
        <path d="M16 0 L 22 -4 L 22 4 Z" fill="#3aa3c2" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="3" cy="-0.8" r="1" fill={INK} />
      </g>
    );
  }
  // umbrella
  return (
    <g transform="translate(18 50)">
      <line x1="0" y1="18" x2="0" y2="-4" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M-12 -4 q 12 -12 24 0 z" fill={CORAL} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M-12 -4 q 12 -12 24 0" stroke={CORAL_DEEP} strokeWidth="1" fill="none" />
      <path d="M-6 -4 q 0 -8 0 -10 M6 -4 q 0 -8 0 -10" stroke={CORAL_DEEP} strokeWidth="1.2" fill="none" />
      <path d="M0 18 q 3 2 5 0" stroke={INK} strokeWidth="2" fill="none" />
    </g>
  );
}
