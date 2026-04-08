// Verification code generation and validation

import { D1Database } from "./d1-types";
import { generateId } from "./utils";

const CODE_EXPIRY_MINUTES = 10;
const MAX_CODES_PER_HOUR = 5;

export function generateCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1000000).padStart(6, "0");
}

export async function createVerificationCode(
  db: D1Database,
  email: string
): Promise<string> {
  const normalizedEmail = email.toLowerCase().trim();

  // Rate limit: max codes per email per hour
  const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;
  const recentCodes = await db
    .prepare(
      `SELECT COUNT(*) as count FROM verification_codes
       WHERE email = ? AND created_at > datetime(?, 'unixepoch')`
    )
    .bind(normalizedEmail, oneHourAgo)
    .first<{ count: number }>();

  if (recentCodes && recentCodes.count >= MAX_CODES_PER_HOUR) {
    throw new Error("Too many code requests. Please try again later.");
  }

  const code = generateCode();
  const expiresAt = Math.floor(Date.now() / 1000) + CODE_EXPIRY_MINUTES * 60;

  await db
    .prepare(
      "INSERT INTO verification_codes (id, email, code, expires_at) VALUES (?, ?, ?, ?)"
    )
    .bind(generateId(), normalizedEmail, code, expiresAt)
    .run();

  return code;
}

export async function verifyCode(
  db: D1Database,
  email: string,
  code: string
): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim();
  const now = Math.floor(Date.now() / 1000);

  // Atomically mark the code as used — only succeeds if unused and not expired
  const result = await db
    .prepare(
      `UPDATE verification_codes SET used = 1
       WHERE email = ? AND code = ? AND expires_at > ? AND used = 0`
    )
    .bind(normalizedEmail, code, now)
    .run();

  // Clean up expired codes opportunistically
  db.prepare("DELETE FROM verification_codes WHERE expires_at < ?")
    .bind(now)
    .run()
    .catch(() => {}); // fire and forget

  return result.meta.changes > 0;
}
