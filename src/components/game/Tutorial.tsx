import { useEffect, useState, type ReactNode } from "react";

const HIDE_KEY_PREFIX = "touch-grass:tutorial-hide:";

export function shouldShowTutorial(gameKey: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(HIDE_KEY_PREFIX + gameKey) !== "1";
}

export function resetTutorialDismissals() {
  if (typeof window === "undefined") return;
  Object.keys(localStorage)
    .filter((k) => k.startsWith(HIDE_KEY_PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}

export interface TutorialStep {
  title: string;
  body: ReactNode;
  icon?: string; // emoji
}

export function Tutorial({
  gameKey,
  title,
  accent = "#5b9e3d",
  accentDeep = "#3a7026",
  steps,
  onStart,
}: {
  gameKey: string;
  title: string;
  accent?: string;
  accentDeep?: string;
  steps: TutorialStep[];
  onStart: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    if (shouldShowTutorial(gameKey)) setOpen(true);
    // else: caller checks shouldShowTutorial and decides to render this component or not
  }, [gameKey]);

  if (!open) return null;

  function close(start: boolean) {
    if (dontShow) localStorage.setItem(HIDE_KEY_PREFIX + gameKey, "1");
    setOpen(false);
    if (start) onStart();
  }

  const step = steps[i];
  const last = i === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div
        className="relative w-full max-w-md rounded-3xl border-[2.5px] bg-white p-6"
        style={{
          borderColor: "color-mix(in oklab, #1f2933 14%, transparent)",
          boxShadow: `0 8px 0 ${accentDeep}`,
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: accentDeep }}>
            How to play · {title}
          </div>
          <button
            onClick={() => close(true)}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Skip ✕
          </button>
        </div>

        <div className="grid place-items-center">
          {step.icon && <div className="mb-3 text-5xl leading-none">{step.icon}</div>}
          <h3 className="text-center font-display text-2xl leading-tight tracking-tight">{step.title}</h3>
          <div className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">{step.body}</div>
        </div>

        {/* dots */}
        <div className="mt-5 flex justify-center gap-1.5">
          {steps.map((_, k) => (
            <span
              key={k}
              className="h-2 rounded-full transition-all"
              style={{
                width: k === i ? 20 : 8,
                background: k === i ? accent : "color-mix(in oklab, #1f2933 18%, transparent)",
              }}
            />
          ))}
        </div>

        <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
          <input
            type="checkbox"
            checked={dontShow}
            onChange={(e) => setDontShow(e.target.checked)}
            className="h-4 w-4 accent-current"
            style={{ accentColor: accent }}
          />
          Don't show this again
        </label>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            onClick={() => setI((p) => Math.max(0, p - 1))}
            disabled={i === 0}
            className="rounded-full border-[2px] bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40"
            style={{ borderColor: "color-mix(in oklab, #1f2933 14%, transparent)" }}
          >
            ← Back
          </button>
          {last ? (
            <button
              onClick={() => close(true)}
              className="rounded-full px-5 py-2.5 text-sm font-bold text-white"
              style={{ background: accent, boxShadow: `0 3px 0 ${accentDeep}` }}
            >
              Let's play →
            </button>
          ) : (
            <button
              onClick={() => setI((p) => Math.min(steps.length - 1, p + 1))}
              className="rounded-full px-5 py-2.5 text-sm font-bold text-white"
              style={{ background: accent, boxShadow: `0 3px 0 ${accentDeep}` }}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
