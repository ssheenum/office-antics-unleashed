export function GameBanner({
  image,
  theme,
  tagline,
}: {
  image: string;
  theme: "ducks" | "connect" | "circle" | "fruit";
  tagline: string;
}) {
  return (
    <div className={`game-banner theme-${theme} mb-5`}>
      <img
        src={image}
        alt=""
        className="float-bob h-28 w-auto md:h-36"
        loading="lazy"
      />
      <p className="font-display text-sm uppercase tracking-wider text-ink md:text-base" style={{ color: "var(--ink)" }}>
        {tagline}
      </p>
    </div>
  );
}
