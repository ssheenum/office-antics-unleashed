// Pond & garden marks — friendly flat illustrations.
// Colors come from inline fills so tiles look the same in any text context.
import type { SVGProps } from "react";

const SKY = "#06aed5";
const SKY_DEEP = "#0a8aaa";
const GOLD = "#ffd166";
const GOLD_DEEP = "#e9b13d";
const LEAF = "#2dd4a8";
const LEAF_DEEP = "#1ba884";
const CORAL = "#ff7a59";
const INK = "#1f2933";
const CREAM = "#fdf6e3";

export function Monogram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 96 96" fill="none" {...props}>
      {/* sun */}
      <circle cx="72" cy="22" r="10" fill={GOLD} stroke={INK} strokeWidth="2.5" />
      {/* pond */}
      <ellipse cx="48" cy="64" rx="40" ry="22" fill={SKY} stroke={INK} strokeWidth="2.5" />
      <ellipse cx="48" cy="60" rx="40" ry="22" fill="none" stroke={SKY_DEEP} strokeWidth="1.5" opacity="0.6" />
      {/* lily pad */}
      <path d="M22 62 A 12 8 0 1 0 46 62 L 22 62 Z" fill={LEAF} stroke={INK} strokeWidth="2" />
      {/* lily flower */}
      <circle cx="34" cy="58" r="3.2" fill={CREAM} stroke={INK} strokeWidth="1.6" />
      {/* duck silhouette */}
      <g transform="translate(54 50)">
        <ellipse cx="9" cy="9" rx="11" ry="6.5" fill={GOLD} stroke={INK} strokeWidth="2" />
        <circle cx="17" cy="3" r="5" fill={GOLD} stroke={INK} strokeWidth="2" />
        <circle cx="18.5" cy="2" r="1.1" fill={INK} />
        <path d="M21 4 L26 3.5 L23 6.5 Z" fill={CORAL} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function DuckMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 96 72" fill="none" {...props}>
      {/* lily pad */}
      <path d="M6 56 A 26 14 0 1 0 70 56 L 6 56 Z" fill={LEAF} stroke={INK} strokeWidth="2.5" />
      <path d="M18 55 L 28 48" stroke={LEAF_DEEP} strokeWidth="1.6" strokeLinecap="round" />
      {/* duck body */}
      <ellipse cx="46" cy="38" rx="22" ry="13" fill={GOLD} stroke={INK} strokeWidth="2.5" />
      <ellipse cx="46" cy="36" rx="22" ry="13" fill="none" stroke={GOLD_DEEP} strokeWidth="1.4" opacity="0.5" />
      {/* head */}
      <circle cx="64" cy="22" r="11" fill={GOLD} stroke={INK} strokeWidth="2.5" />
      {/* eye */}
      <circle cx="67" cy="20" r="1.6" fill={INK} />
      <circle cx="67.6" cy="19.5" r="0.45" fill={CREAM} />
      {/* beak */}
      <path d="M74 23 L84 21 L78 28 Z" fill={CORAL} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      {/* wing */}
      <path d="M36 32 q 8 -6 18 0" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      {/* water ripples */}
      <path d="M76 60 q 4 -2 8 0" stroke={SKY_DEEP} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M82 64 q 3 -1.5 6 0" stroke={SKY_DEEP} strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function DiverMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 80 96" fill="none" {...props}>
      {/* pond water */}
      <rect x="2" y="40" width="76" height="52" rx="10" fill={SKY} stroke={INK} strokeWidth="2.5" />
      {/* surface ripple */}
      <path d="M4 44 q 8 -3 16 0 t 16 0 t 16 0 t 16 0" stroke={SKY_DEEP} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* koi 1 */}
      <g transform="translate(18 56)">
        <ellipse cx="10" cy="6" rx="11" ry="5" fill={CORAL} stroke={INK} strokeWidth="2" />
        <path d="M20 6 L 26 1 L 26 11 Z" fill={CORAL} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <circle cx="6" cy="5" r="1.2" fill={INK} />
        <circle cx="12" cy="3" r="1.4" fill={CREAM} stroke={INK} strokeWidth="0.8" />
      </g>
      {/* koi 2 */}
      <g transform="translate(40 76)">
        <ellipse cx="10" cy="6" rx="11" ry="5" fill={GOLD} stroke={INK} strokeWidth="2" />
        <path d="M20 6 L 26 1 L 26 11 Z" fill={GOLD} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <circle cx="6" cy="5" r="1.2" fill={INK} />
      </g>
      {/* bubbles */}
      <circle cx="20" cy="34" r="2.5" fill={CREAM} stroke={INK} strokeWidth="1.6" />
      <circle cx="28" cy="22" r="1.8" fill={CREAM} stroke={INK} strokeWidth="1.4" />
      <circle cx="24" cy="14" r="1.2" fill={CREAM} stroke={INK} strokeWidth="1.2" />
      {/* lily pad floating */}
      <path d="M48 36 A 10 5 0 1 0 68 36 L 48 36 Z" fill={LEAF} stroke={INK} strokeWidth="2" />
    </svg>
  );
}

export function BranchMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 96 72" fill="none" {...props}>
      {/* branch */}
      <path d="M2 18 q 22 6 46 6 t 46 -6" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* leaves */}
      <path d="M22 14 q -8 -8 -16 -4 q 0 8 8 12 z" fill={LEAF} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M70 14 q 8 -8 16 -4 q 0 8 -8 12 z" fill={LEAF} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      {/* stems */}
      <line x1="24" y1="24" x2="24" y2="34" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <line x1="48" y1="26" x2="48" y2="38" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <line x1="70" y1="24" x2="70" y2="36" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      {/* fruit */}
      <circle cx="24" cy="42" r="8" fill={CORAL} stroke={INK} strokeWidth="2.5" />
      <circle cx="48" cy="48" r="10" fill={GOLD} stroke={INK} strokeWidth="2.5" />
      <circle cx="70" cy="46" r="9" fill={LEAF} stroke={INK} strokeWidth="2.5" />
      {/* shines */}
      <circle cx="21" cy="39" r="1.6" fill={CREAM} opacity="0.9" />
      <circle cx="45" cy="44" r="2" fill={CREAM} opacity="0.9" />
      <circle cx="67" cy="43" r="1.6" fill={CREAM} opacity="0.9" />
      {/* basket hint */}
      <path d="M30 64 q 18 8 36 0" stroke={INK} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
    </svg>
  );
}

/* Tiny decorative marks for the hub */
export function CloudPuff(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 80 40" fill="none" {...props}>
      <path d="M10 30 q 0 -14 14 -14 q 4 -10 16 -10 q 14 0 16 12 q 10 0 12 12 z"
        fill="#ffffff" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function CattailMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 80" fill="none" {...props}>
      <line x1="20" y1="78" x2="20" y2="22" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <rect x="15" y="20" width="10" height="22" rx="5" fill="#7a4e2c" stroke={INK} strokeWidth="2" />
      <path d="M20 18 q -6 -10 -14 -10 q 0 8 14 14 z" fill={LEAF} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M20 18 q 6 -10 14 -10 q 0 8 -14 14 z" fill={LEAF} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
