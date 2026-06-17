import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { sampleUsernames, setCurrentUser, listUsers, sanitizeUsername } from "@/lib/session";
import loginScene from "@/assets/login-scene.png";
import mascotTurtle from "@/assets/mascot-turtle.png";

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
const CHIP_COLORS: { bg: string; deep: string; text: string }[] = [
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
  // start empty so SSR + first client render match; shuffle after mount
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    setReturning(listUsers());
    setNames(sampleUsernames(8));
  }, []);

  const value = sanitizeUsername(custom || picked || "");
  const canGo = value.length >= 2;

  function go(name: string) {
    setCurrentUser(name);
    navigate({ to: "/" });
  }

  const chips = useMemo(
    () => names.map((n: string, i: number) => ({ name: n, c: CHIP_COLORS[i % CHIP_COLORS.length] })),
    [names],
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* hero grass scene */}
      <div className="absolute inset-x-0 top-0 h-[55vh]">
        <img
          src={loginScene}
          alt=""
          className="h-full w-full object-cover"
          width={1536}
          height={768}
        />
        <div className="absolute inset-x-0 bottom-0 h-32" style={{ background: "linear-gradient(to bottom, transparent, #fdf6e3)" }} />
      </div>

      <main className="relative mx-auto max-w-2xl px-5 pb-12 pt-8 md:pt-10">
        <div className="text-center">
          <img
            src={mascotTurtle}
            alt="Touch grass mascot"
            width={140}
            height={140}
            className="mx-auto drop-shadow-lg"
            style={{ width: 140, height: 140 }}
          />
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border-[2px] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ borderColor: "color-mix(in oklab, #1f2933 14%, transparent)" }}>
            <span className="h-2 w-2 rounded-full" style={{ background: "#5b9e3d" }} />
            5 minute brain break · then go outside
          </div>
          <h1 className="mt-4 font-display text-5xl leading-[0.98] tracking-tight md:text-6xl">
            <span style={{ color: "#3a8c2d" }}>Come</span> touch <span className="relative inline-block">
              grass
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" preserveAspectRatio="none" height="10">
                <path d="M2 8 Q 50 2, 100 7 T 198 6" stroke="#5b9e3d" strokeWidth="4" strokeLinecap="round" fill="none" />
              </svg>
            </span>
            .
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            Pick a name. Your scores stick to it.
          </p>
        </div>

        {returning.length > 0 && (
          <div className="mt-7 rounded-3xl border-[2px] bg-white/85 p-5 backdrop-blur" style={{ borderColor: "color-mix(in oklab, #1f2933 12%, transparent)", boxShadow: "0 4px 0 color-mix(in oklab, #1f2933 10%, transparent)" }}>
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Welcome back</div>
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
            <button
              onClick={() => setNames(sampleUsernames(8))}
              className="text-[10px] font-bold uppercase tracking-[0.16em] transition-transform hover:-translate-y-0.5"
              style={{ color: "#5b9e3d" }}
            >
              ↻ Shuffle
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {chips.map(({ name, c }: { name: string; c: { bg: string; deep: string; text: string } }) => {
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
            placeholder="come touch grass"
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
