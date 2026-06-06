// Inline SVG marks — gold line art on dark. Stroke uses currentColor.
import type { SVGProps } from "react";

export function Monogram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" {...props}>
      <circle cx="32" cy="32" r="28" />
      <path d="M22 26v8a10 10 0 0 0 20 0v-8" />
      <path d="M22 26h20" />
      <circle cx="32" cy="32" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function DuckMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 80 64" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* body */}
      <path d="M10 42c0-10 10-16 22-16 8 0 14 3 18 7l16-2-8 8c2 8-4 16-16 18-16 2-32-4-32-15z" />
      {/* head */}
      <circle cx="56" cy="22" r="9" />
      {/* eye */}
      <circle cx="58" cy="20" r="1.2" fill="currentColor" stroke="none" />
      {/* beak */}
      <path d="M64 23l8-1-5 4z" fill="currentColor" fillOpacity="0.15" />
      {/* water line */}
      <path d="M4 52c6-2 10 2 16 0s10-2 16 0 10 2 16 0 10-2 16 0" opacity="0.5" />
    </svg>
  );
}

export function DiverMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 80" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* helmet */}
      <circle cx="32" cy="26" r="16" />
      <rect x="22" y="22" width="20" height="10" rx="2" />
      <line x1="22" y1="27" x2="42" y2="27" />
      {/* neck + suit */}
      <path d="M24 41h16v6h-16z" />
      <path d="M18 47h28v18a6 6 0 0 1-6 6h-16a6 6 0 0 1-6-6z" />
      {/* bubbles */}
      <circle cx="48" cy="14" r="2" opacity="0.7" />
      <circle cx="54" cy="8" r="1.3" opacity="0.5" />
      <circle cx="50" cy="4" r="0.9" opacity="0.4" />
    </svg>
  );
}

export function BranchMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 80 64" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* branch */}
      <path d="M4 14c14 4 26 6 40 6s24-2 32-6" />
      {/* leaves */}
      <path d="M22 12c-2-4-6-6-10-4 0 4 3 7 8 8z" />
      <path d="M52 12c2-4 6-6 10-4 0 4-3 7-8 8z" />
      {/* fruit stems */}
      <line x1="20" y1="20" x2="20" y2="28" />
      <line x1="36" y1="22" x2="36" y2="34" />
      <line x1="54" y1="20" x2="54" y2="30" />
      {/* fruit */}
      <circle cx="20" cy="34" r="6" />
      <circle cx="36" cy="42" r="8" />
      <circle cx="54" cy="38" r="7" />
      {/* highlight */}
      <path d="M18 32a3 3 0 0 1 3-1" opacity="0.7" />
    </svg>
  );
}
