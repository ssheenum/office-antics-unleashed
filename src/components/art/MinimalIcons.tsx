import type { SVGProps } from "react";

// Minimal, flat Duolingo-style icons. Single accent color per icon.
// Use currentColor for outlines; pass color via style or className.

export function GrassIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 50 q 6 -22 12 0" />
      <path d="M22 50 q 6 -28 12 0" />
      <path d="M34 50 q 6 -22 12 0" />
      <path d="M46 50 q 5 -18 10 0" />
      <path d="M6 56 h 54" strokeWidth="3.5" />
    </svg>
  );
}

export function DucksIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* three pebble ducks in a row */}
      <circle cx="14" cy="36" r="8" fill="currentColor" fillOpacity="0.18" />
      <circle cx="32" cy="36" r="8" fill="currentColor" fillOpacity="0.18" />
      <circle cx="50" cy="36" r="8" fill="currentColor" fillOpacity="0.18" />
      <circle cx="14" cy="36" r="8" />
      <circle cx="32" cy="36" r="8" />
      <circle cx="50" cy="36" r="8" />
      <path d="M14 28 v -4 M32 28 v -4 M50 28 v -4" />
      <circle cx="14" cy="24" r="1.6" fill="currentColor" />
      <circle cx="32" cy="24" r="1.6" fill="currentColor" />
      <circle cx="50" cy="24" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function DiveIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* magnifying glass over a grid */}
      <rect x="10" y="10" width="36" height="36" rx="4" fill="currentColor" fillOpacity="0.12" />
      <path d="M10 22 H 46 M10 34 H 46 M22 10 V 46 M34 10 V 46" strokeOpacity="0.55" />
      <circle cx="40" cy="40" r="10" fill="white" />
      <circle cx="40" cy="40" r="10" />
      <path d="M48 48 L 56 56" strokeWidth="4" />
    </svg>
  );
}

export function FruitIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* apple silhouette */}
      <path d="M32 18 C 22 18 14 26 16 38 C 18 50 28 52 32 48 C 36 52 46 50 48 38 C 50 26 42 18 32 18 Z" fill="currentColor" fillOpacity="0.18" />
      <path d="M32 18 q -1 -6 -6 -8" />
      <path d="M32 18 q 6 -5 12 -2 q -3 7 -10 7" fill="currentColor" fillOpacity="0.35" />
    </svg>
  );
}

export function TrophyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 14 H 44 V 26 a 12 12 0 0 1 -24 0 Z" fill="currentColor" fillOpacity="0.18" />
      <path d="M20 18 H 12 v 4 a 8 8 0 0 0 8 8" />
      <path d="M44 18 H 52 v 4 a 8 8 0 0 1 -8 8" />
      <path d="M28 40 h 8 v 6 h 6 v 4 H 22 v -4 h 6 z" fill="currentColor" fillOpacity="0.35" />
    </svg>
  );
}

export function FlameIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M32 10 C 24 22 18 26 18 38 a 14 14 0 0 0 28 0 c 0 -6 -4 -10 -8 -14 c 0 6 -4 8 -6 8 c 2 -8 2 -16 0 -22 z" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}
