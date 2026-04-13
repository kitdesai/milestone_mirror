export type Tier = "free" | "premium";

const LIMITS = {
  free: { maxFrames: 5, maxChildren: 2 },
  premium: { maxFrames: Infinity, maxChildren: Infinity },
} as const;

export function canCreateFrame(
  currentCount: number,
  tier: Tier
): { allowed: boolean; limit: number } {
  const limit = LIMITS[tier].maxFrames;
  return { allowed: currentCount < limit, limit };
}

export function canCreateChild(
  currentCount: number,
  tier: Tier
): { allowed: boolean; limit: number } {
  const limit = LIMITS[tier].maxChildren;
  return { allowed: currentCount < limit, limit };
}
