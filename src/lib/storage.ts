import { Child, GoogleTokens } from "@/types";

const CHILDREN_KEY = "milestone-mirror-children";
const TOKENS_KEY = "milestone-mirror-tokens";

// Child profile storage
export function getStoredChildren(): Child[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(CHILDREN_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveChildren(children: Child[]): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(CHILDREN_KEY, JSON.stringify(children));
}

export function addChild(child: Child): Child[] {
  const children = getStoredChildren();
  children.push(child);
  saveChildren(children);
  return children;
}

export function updateChild(updatedChild: Child): Child[] {
  const children = getStoredChildren();
  const index = children.findIndex((c) => c.id === updatedChild.id);
  if (index !== -1) {
    children[index] = updatedChild;
    saveChildren(children);
  }
  return children;
}

export function deleteChild(childId: string): Child[] {
  const children = getStoredChildren().filter((c) => c.id !== childId);
  saveChildren(children);
  return children;
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Token storage (in localStorage for simplicity, but in production use httpOnly cookies)
export function getStoredTokens(): GoogleTokens | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(TOKENS_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function saveTokens(tokens: GoogleTokens): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKENS_KEY);
}

export function isTokenExpired(tokens: GoogleTokens): boolean {
  // Add 5 minute buffer
  return Date.now() >= tokens.expires_at - 5 * 60 * 1000;
}
