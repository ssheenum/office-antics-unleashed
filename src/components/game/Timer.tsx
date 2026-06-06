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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, running]);
  const pct = Math.max(0, Math.min(100, (left / seconds) * 100));
  const isLow = left < 15;
  return (
    <div className="flex items-center gap-2.5">
      <span className="font-display text-lg tabular-nums" style={{ color: isLow ? "var(--warn)" : "var(--cream)" }}>
        {String(Math.floor(left / 60)).padStart(2, "0")}:{String(left % 60).padStart(2, "0")}
      </span>
      <div className="h-1.5 w-28 overflow-hidden rounded-full" style={{ background: "color-mix(in oklab, white 8%, transparent)" }}>
        <div className="h-full transition-all" style={{ width: `${pct}%`, background: isLow ? "var(--warn)" : "var(--gold)" }} />
      </div>
    </div>
  );
}
