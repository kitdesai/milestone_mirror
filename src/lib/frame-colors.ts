import type { CSSProperties } from "react";

export const FRAME_COLORS = {
  peach: { style: { background: "linear-gradient(to right, #fdeee8, #fce8ed)" }, hex: "#fdeee8", label: "Peach" },
  sage: { style: { background: "#DDE8D6" }, hex: "#DDE8D6", label: "Sage" },
  sky: { style: { background: "#D6DEE8" }, hex: "#D6DEE8", label: "Sky" },
  blush: { style: { background: "#E8D6D6" }, hex: "#E8D6D6", label: "Blush" },
  sand: { style: { background: "#E8E4D6" }, hex: "#E8E4D6", label: "Sand" },
  lavender: { style: { background: "#DDD6E8" }, hex: "#DDD6E8", label: "Lavender" },
} as const;

export type FrameColor = keyof typeof FRAME_COLORS;

export function getFrameColorStyle(color?: string | null): CSSProperties {
  const key = (color || "peach") as FrameColor;
  return FRAME_COLORS[key]?.style || FRAME_COLORS.peach.style;
}
