// Generate unique ID (Edge-compatible)
export function generateId(): string {
  return crypto.randomUUID();
}

// Generate a short URL-safe share token
export function generateShareToken(length = 10): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (v) => chars[v % chars.length]).join("");
}

// Classname utility (like clsx)
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
