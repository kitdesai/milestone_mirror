// Generate unique ID (Edge-compatible)
export function generateId(): string {
  return crypto.randomUUID();
}

// Classname utility (like clsx)
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
