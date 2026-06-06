import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function GameShell({
  title,
  skill,
  children,
  rightSlot,
}: {
  title: string;
  skill: string;
  children: ReactNode;
  rightSlot?: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 glass">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="pill-btn text-xs">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Hub
            </Link>
            <div>
              <h1 className="font-display text-xl leading-none">{title}</h1>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Trains · {skill}</p>
            </div>
          </div>
          <div>{rightSlot}</div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
