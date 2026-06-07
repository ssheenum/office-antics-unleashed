import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QUIRKY_USERNAMES, setCurrentUser, listUsers, sanitizeUsername, getCurrentUser } from "@/lib/session";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Pick a name — Touch Grass" },
      { name: "description", content: "Pick a quirky username and your scores follow you each time you come back." },
    ],
  }),
  component: LoginPage,
});

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

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* horizon */}
      <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: "linear-gradient(to top, #8bce6a 0%, #b6e08a 60%, transparent 100%)" }} />
      <div className="absolute inset-x-0 bottom-0 h-3 opacity-50" style={{ background: "repeating-linear-gradient(90deg, #5b9e3d 0 3px, transparent 3px 9px)" }} />

      <main className="relative mx-auto max-w-2xl px-5 py-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border-[2px] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ borderColor: "color-mix(in oklab, #1f2933 14%, transparent)" }}>
            <span className="h-2 w-2 rounded-full" style={{ background: "#5b9e3d" }} />
            Touch Grass
          </div>
          <h1 className="mt-6 font-display text-5xl leading-[1.02] tracking-tight md:text-6xl">
            Pick a <span style={{ color: "#3a8c2d" }}>grass name</span>.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Your name keeps your scores on this device. Choose a quirky one — or invent your own.
          </p>
        </div>

        {returning.length > 0 && (
          <div className="glass mt-10 p-5">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Welcome back</div>
            <div className="flex flex-wrap gap-2">
              {returning.map((u) => (
                <button key={u} onClick={() => go(u)} className="pill-btn text-sm">
                  {u}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="glass mt-6 p-6">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Pick a quirky one</div>
          <div className="flex flex-wrap gap-2">
            {QUIRKY_USERNAMES.map((n) => {
              const active = picked === n && !custom;
              return (
                <button
                  key={n}
                  onClick={() => { setPicked(n); setCustom(""); }}
                  className="rounded-full border-[2px] px-3.5 py-1.5 text-sm font-semibold transition-all"
                  style={{
                    background: active ? "#5b9e3d" : "white",
                    color: active ? "white" : "#1f2933",
                    borderColor: active ? "#3a7026" : "color-mix(in oklab, #1f2933 14%, transparent)",
                    boxShadow: active ? "0 3px 0 #3a7026" : "0 2px 0 color-mix(in oklab, #1f2933 12%, transparent)",
                  }}
                >
                  {n}
                </button>
              );
            })}
          </div>

          <div className="my-5 hairline" />

          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Or invent your own</div>
          <input
            value={custom}
            onChange={(e) => { setCustom(e.target.value); setPicked(null); }}
            placeholder="e.g. RootBeerRogue"
            maxLength={20}
            className="w-full rounded-2xl border-[2px] bg-white px-4 py-3 font-display text-lg outline-none focus:border-[#5b9e3d]"
            style={{ borderColor: "color-mix(in oklab, #1f2933 14%, transparent)" }}
          />

          <button
            disabled={!canGo}
            onClick={() => go(value)}
            className="pill-btn pill-btn-leaf mt-5 w-full justify-center text-base"
          >
            Step onto the grass →
          </button>
        </div>
      </main>
    </div>
  );
}
