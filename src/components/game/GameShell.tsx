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
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm font-display uppercase tracking-wider hover:text-toner">
              ← Hub
            </Link>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-xl font-display leading-none">{title}</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Trains: {skill}</p>
            </div>
          </div>
          <div>{rightSlot}</div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
