import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { QUIRKY_USERNAMES, setCurrentUser, listUsers, sanitizeUsername } from "@/lib/session";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Come Touch Grass — pick your name" },
      { name: "description", content: "Pick a fun name and your scores follow you each time you come back." },
    ],
  }),
  component: LoginPage,
});

// playful palette per chip
const CHIP_COLORS = [
  { bg: "#fff4d6", deep: "#b07a13", text: "#7a5208" },
  { bg: "#ffe0e6", deep: "#9a2e3b", text: "#7a1d2a" },
  { bg: "#e2f3fb", deep: "#1d6b8e", text: "#114e6c" },
  { bg: "#e6f6d8", deep: "#3a7026", text: "#2b5a1c" },
  { bg: "#efe4ff", deep: "#5b3aa8", text: "#3f2680" },
  { bg: "#ffe6cf", deep: "#a14b13", text: "#7a3608" },
];

function LoginPage() {
  const navigate = useNavigate();
  const [picked, setPicked] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [returning, setReturning] = useState<string[]>([]);

  useEffect(() => { setReturning(listUsers()); }, []);

  const value = sanitizeUsername(custom || picked || "");
  const canGo = value.length >= 2;

  function go(name: string) {
    setCurrentUser(name);
    navigate({ to: "/" });
  }

  const chips = useMemo(
    () => QUIRKY_USERNAMES.map((n, i) => ({ name: n, c: CHIP_COLORS[i % CHIP_COLORS.length] })),
    [],
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* sky */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #d8efff 0%, #fdf6e3 55%)" }} />
      {/* sun */}
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-70" style={{ background: "radial-gradient(circle at 30% 30%, #ffe27a, #ffd24a 55%, transparent 70%)" }} />
      {/* clouds */}
      <Cloud className="absolute left-[6%] top-[10%] opacity-90" width={120} />
      <Cloud className="absolute right-[14%] top-[22%] opacity-80" width={90} />
      {/* hills */}
      <div className="absolute inset-x-0 bottom-[28vh] h-40 opacity-80" style={{
        background: "radial-gradient(60% 100% at 20% 100%, #a9d987 0 60%, transparent 61%), radial-gradient(70% 100% at 80% 100%, #94cf6f 0 55%, transparent 56%)",
      }} />
      {/* grass band */}
      <div className="absolute inset-x-0 bottom-0 h-[28vh]" style={{
        background: "linear-gradient(to top, #6fb84a 0%, #8ccc63 60%, #b6e08a 100%)",
      }} />
      <div className="absolute inset-x-0 bottom-0 h-3 opacity-60" style={{ background: "repeating-linear-gradient(90deg, #3a7026 0 3px, transparent 3px 9px)" }} />
      {/* tiny flowers */}
      <Flower className="absolute bottom-[6vh] left-[12%]" color="#ff7aa8" />
      <Flower className="absolute bottom-[4vh] left-[28%]" color="#ffd24a" />
      <Flower className="absolute bottom-[9vh] right-[18%]" color="#9b6cff" />
      <Flower className="absolute bottom-[3vh] right-[34%]" color="#ff7aa8" />

      <main className="relative mx-auto max-w-2xl px-5 py-12 md:py-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border-[2px] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ borderColor: "color-mix(in oklab, #1f2933 14%, transparent)" }}>
            <span className="h-2 w-2 rounded-full" style={{ background: "#5b9e3d" }} />
            5 minute brain break
          </div>
          <h1 className="mt-5 font-display text-5xl leading-[0.98] tracking-tight md:text-7xl">
            <span style={{ color: "#3a8c2d" }}>Come</span> touch <span className="relative inline-block">
              grass
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" preserveAspectRatio="none" height="10">
                <path d="M2 8 Q 50 2, 100 7 T 198 6" stroke="#5b9e3d" strokeWidth="4" strokeLinecap="round" fill="none" />
              </svg>
            </span>
            .
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            Pick a name. Your scores stick to it.
          </p>
        </div>

        {returning.length > 0 && (
          <div className="mt-8 rounded-3xl border-[2px] bg-white/85 p-5 backdrop-blur" style={{ borderColor: "color-mix(in oklab, #1f2933 12%, transparent)", boxShadow: "0 4px 0 color-mix(in oklab, #1f2933 10%, transparent)" }}>
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">👋 Welcome back</div>
            <div className="flex flex-wrap gap-2">
              {returning.map((u) => (
                <button key={u} onClick={() => go(u)} className="rounded-full border-[2px] bg-white px-3.5 py-1.5 text-sm font-semibold transition-transform hover:-translate-y-0.5" style={{ borderColor: "color-mix(in oklab, #1f2933 14%, transparent)", boxShadow: "0 2px 0 color-mix(in oklab, #1f2933 12%, transparent)" }}>
                  {u}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 rounded-3xl border-[2px] bg-white/90 p-6 backdrop-blur" style={{ borderColor: "color-mix(in oklab, #1f2933 12%, transparent)", boxShadow: "0 5px 0 color-mix(in oklab, #1f2933 10%, transparent)" }}>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Pick a name</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "#5b9e3d" }}>{QUIRKY_USERNAMES.length} options</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {chips.map(({ name, c }) => {
              const active = picked === name && !custom;
              return (
                <button
                  key={name}
                  onClick={() => { setPicked(name); setCustom(""); }}
                  className="rounded-full border-[2px] px-3.5 py-1.5 text-sm font-semibold transition-all hover:-translate-y-0.5"
                  style={{
                    background: active ? c.deep : c.bg,
                    color: active ? "white" : c.text,
                    borderColor: active ? c.deep : `color-mix(in oklab, ${c.deep} 35%, transparent)`,
                    boxShadow: active ? `0 3px 0 color-mix(in oklab, ${c.deep} 70%, black)` : `0 2px 0 color-mix(in oklab, ${c.deep} 35%, transparent)`,
                  }}
                >
                  {name}
                </button>
              );
            })}
          </div>

          <div className="my-5 h-px" style={{ background: "color-mix(in oklab, #1f2933 10%, transparent)" }} />

          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">…or make one up</div>
          <input
            value={custom}
            onChange={(e) => { setCustom(e.target.value); setPicked(null); }}
            placeholder="e.g. LawnEnjoyer42"
            maxLength={20}
            className="w-full rounded-2xl border-[2px] bg-white px-4 py-3 font-display text-lg outline-none transition-colors focus:border-[#5b9e3d]"
            style={{ borderColor: "color-mix(in oklab, #1f2933 14%, transparent)" }}
          />

          <button
            disabled={!canGo}
            onClick={() => go(value)}
            className="mt-5 w-full rounded-2xl px-5 py-3.5 text-base font-bold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: "#5b9e3d", boxShadow: "0 4px 0 #3a7026" }}
          >
            {canGo ? `Let's go, ${value} →` : "Pick or type a name"}
          </button>
        </div>
      </main>
    </div>
  );
}

function Cloud({ className, width = 100 }: { className?: string; width?: number }) {
  return (
    <svg className={className} width={width} height={width * 0.5} viewBox="0 0 100 50" fill="white">
      <ellipse cx="30" cy="32" rx="22" ry="14" />
      <ellipse cx="55" cy="26" rx="20" ry="16" />
      <ellipse cx="75" cy="34" rx="18" ry="12" />
    </svg>
  );
}

function Flower({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} width="22" height="28" viewBox="0 0 22 28">
      <line x1="11" y1="14" x2="11" y2="28" stroke="#3a7026" strokeWidth="2" strokeLinecap="round" />
      <circle cx="11" cy="9" r="3" fill={color} />
      <circle cx="6" cy="11" r="3" fill={color} />
      <circle cx="16" cy="11" r="3" fill={color} />
      <circle cx="11" cy="14" r="3" fill={color} />
      <circle cx="11" cy="9" r="1.2" fill="#fff8c2" />
    </svg>
  );
}
