export function GameBanner({
  image,
  accent,
  tagline,
}: {
  image: string;
  accent: "ducks" | "connect" | "circle" | "fruit";
  tagline: string;
}) {
  return (
    <div className={`accent-${accent} mb-6 flex items-center gap-4 rounded-2xl p-4`} style={{ background: "var(--accent-bg)" }}>
      <div className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-2xl bg-white/60">
        <img src={image} alt="" loading="lazy" className="float-bob h-14 w-14 object-contain" />
      </div>
      <p className="text-sm font-semibold leading-snug" style={{ color: "var(--accent-ink)" }}>
        {tagline}
      </p>
    </div>
  );
}
