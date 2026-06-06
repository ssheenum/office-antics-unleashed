import { useEffect, useState } from "react";

export function Timer({
  seconds,
  running,
  onExpire,
  onTick,
}: {
  seconds: number;
  running: boolean;
  onExpire?: () => void;
  onTick?: (left: number) => void;
}) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => setLeft(seconds), [seconds]);
  useEffect(() => {
    onTick?.(left);
    if (!running) return;
    if (left <= 0) { onExpire?.(); return; }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, running]);
  const pct = Math.max(0, Math.min(100, (left / seconds) * 100));
  const low = left < 10;
  return (
    <div className="flex items-center gap-2.5">
      <span className="font-display text-lg tabular-nums" style={{ color: low ? "var(--coral)" : "var(--ink)" }}>
        {String(Math.floor(left / 60)).padStart(2, "0")}:{String(left % 60).padStart(2, "0")}
      </span>
      <div
        className="h-2 w-28 overflow-hidden rounded-full border-[1.5px]"
        style={{ background: "white", borderColor: "color-mix(in oklab, #1f2933 12%, transparent)" }}
      >
        <div className="h-full transition-all" style={{ width: `${pct}%`, background: low ? "var(--coral)" : "var(--sky)" }} />
      </div>
    </div>
  );
}
