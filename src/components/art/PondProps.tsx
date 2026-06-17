// Cartoon underwater sprites for the Deep Dive puzzle — flat illustrated PNGs.
import type { PropKind } from "@/lib/puzzles/deepdive";
import redCoral from "@/assets/dd-red-coral.png";
import blueCoral from "@/assets/dd-blue-coral.png";
import jellyfish from "@/assets/dd-jellyfish.png";
import turtle from "@/assets/dd-turtle.png";
import anchor from "@/assets/dd-anchor.png";
import seaweed from "@/assets/dd-seaweed.png";
import bubble from "@/assets/dd-bubble.png";
import shell from "@/assets/dd-shell.png";
import treasure from "@/assets/dd-treasure.png";

const SOURCES: Record<PropKind, string> = {
  redCoral,
  blueCoral,
  jellyfish,
  turtle,
  anchor,
  seaweed,
  bubble,
  shell,
};

export function PropSprite({ kind, size }: { kind: PropKind; size?: number }) {
  return (
    <img
      src={SOURCES[kind]}
      alt=""
      loading="lazy"
      draggable={false}
      style={{
        width: size ?? "100%",
        height: size ?? "100%",
        objectFit: "contain",
        filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.18))",
      }}
    />
  );
}

export function TreasureSprite({ size }: { size?: number }) {
  return (
    <img
      src={treasure}
      alt=""
      loading="lazy"
      draggable={false}
      style={{
        width: size ?? "100%",
        height: size ?? "100%",
        objectFit: "contain",
        filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.22))",
      }}
    />
  );
}
