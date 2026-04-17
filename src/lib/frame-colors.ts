export const FRAME_COLORS = {
  peach: { bg: "bg-gradient-to-r from-peach-100 to-rose-100", label: "Peach" },
  sage: { bg: "bg-[#DDE8D6]", label: "Sage" },
  sky: { bg: "bg-[#D6DEE8]", label: "Sky" },
  blush: { bg: "bg-[#E8D6D6]", label: "Blush" },
  sand: { bg: "bg-[#E8E4D6]", label: "Sand" },
  lavender: { bg: "bg-[#DDD6E8]", label: "Lavender" },
} as const;

export type FrameColor = keyof typeof FRAME_COLORS;

export function getFrameColorClass(color?: string | null): string {
  const key = (color || "peach") as FrameColor;
  return FRAME_COLORS[key]?.bg || FRAME_COLORS.peach.bg;
}
