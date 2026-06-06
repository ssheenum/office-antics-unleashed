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
    if (left <= 0) {
      onExpire?.();
      return;
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left, running, onExpire, onTick]);
  const pct = Math.max(0, Math.min(100, (left / seconds) * 100));
  const color = left < 15 ? "var(--stamp)" : "var(--toner)";
  return (
    <div className="flex items-center gap-2">
      <span className="font-display text-lg tabular-nums" style={{ color }}>
        {String(Math.floor(left / 60)).padStart(2, "0")}:{String(left % 60).padStart(2, "0")}
      </span>
      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
        <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
