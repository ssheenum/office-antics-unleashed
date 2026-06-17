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

export function HeartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="currentColor" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" {...props}>
      <path d="M32 52 C 14 40 8 30 12 20 a 10 10 0 0 1 20 0 a 10 10 0 0 1 20 0 c 4 10 -2 20 -20 32 z" />
    </svg>
  );
}

export function BasketIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 8 q 18 -14 36 0" />
      <rect x="6" y="22" width="52" height="8" rx="4" fill="currentColor" fillOpacity="0.18" />
      <path d="M12 30 L 18 54 H 46 L 52 30 Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M22 32 v 20 M32 32 v 20 M42 32 v 20" strokeOpacity="0.5" />
    </svg>
  );
}

export function AppleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M32 18 C 22 18 14 26 16 38 C 18 50 28 52 32 48 C 36 52 46 50 48 38 C 50 26 42 18 32 18 Z" fill="currentColor" fillOpacity="0.18" />
      <path d="M32 18 q -1 -6 -6 -8" />
      <path d="M32 18 q 6 -5 12 -2 q -3 7 -10 7" fill="currentColor" fillOpacity="0.35" />
    </svg>
  );
}

export function RockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 42 Q 12 18 28 16 Q 50 12 56 32 Q 56 52 30 52 Q 10 52 8 42 Z" fill="currentColor" fillOpacity="0.18" />
      <path d="M20 30 q 4 -4 10 -2 M32 38 q 6 -2 14 -1" strokeOpacity="0.5" strokeWidth="2" />
    </svg>
  );
}

export function MapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 14 L 24 10 L 40 14 L 56 10 V 50 L 40 54 L 24 50 L 8 54 Z" fill="currentColor" fillOpacity="0.14" />
      <path d="M24 10 V 50 M40 14 V 54" />
      <path d="M44 30 l 4 4 l -4 4" />
    </svg>
  );
}

export function TapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="32" cy="22" r="10" fill="currentColor" fillOpacity="0.18" />
      <path d="M32 32 v 14 M32 46 q 0 8 8 8 h 4 a 6 6 0 0 0 6 -6 v -6" />
      <path d="M18 10 l -4 -4 M46 10 l 4 -4 M14 22 h -6 M50 22 h 6" strokeWidth="2.5" />
    </svg>
  );
}

export function NoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" {...props}>
      <circle cx="32" cy="32" r="22" fill="currentColor" fillOpacity="0.12" />
      <path d="M16 16 L 48 48" />
    </svg>
  );
}

export function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 32 Q 18 14 32 14 Q 46 14 60 32 Q 46 50 32 50 Q 18 50 4 32 Z" fill="currentColor" fillOpacity="0.14" />
      <circle cx="32" cy="32" r="8" fill="currentColor" fillOpacity="0.35" />
      <circle cx="32" cy="32" r="3" fill="currentColor" />
    </svg>
  );
}

export function TargetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="32" cy="32" r="22" fill="currentColor" fillOpacity="0.10" />
      <circle cx="32" cy="32" r="14" />
      <circle cx="32" cy="32" r="6" fill="currentColor" fillOpacity="0.35" />
    </svg>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 12 l 5 5 l 11 -12" />
    </svg>
  );
}

export function SparkleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2 L13.6 9.4 L21 11 L13.6 12.6 L12 20 L10.4 12.6 L3 11 L10.4 9.4 Z" />
    </svg>
  );
}

export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2 l 3 7 l 7.5 .8 l -5.7 5 l 1.8 7.4 L 12 18 L 5.4 22.2 l 1.8 -7.4 L 1.5 9.8 L 9 9 Z" />
    </svg>
  );
}

