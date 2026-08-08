// Verification code generation and validation

import { D1Database } from "./d1-types";
import { generateId } from "./utils";

const CODE_EXPIRY_MINUTES = 10;
const MAX_CODES_PER_HOUR = 5;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export interface VerifyResult {
  ok: boolean;
  locked: boolean;
  retryAfterSeconds?: number;
}

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
): Promise<VerifyResult> {
  const normalizedEmail = email.toLowerCase().trim();
  const now = Math.floor(Date.now() / 1000);

  const attempts = await db
    .prepare(
      "SELECT locked_until FROM verification_attempts WHERE email = ?"
    )
    .bind(normalizedEmail)
    .first<{ locked_until: number | null }>();

  if (attempts?.locked_until) {
    if (attempts.locked_until > now) {
      return {
        ok: false,
        locked: true,
        retryAfterSeconds: attempts.locked_until - now,
      };
    }

    // Lockout has been served — clear it so the next miss starts a fresh count.
    await db
      .prepare("DELETE FROM verification_attempts WHERE email = ?")
      .bind(normalizedEmail)
      .run();
  }

  // Atomically mark the code as used — only succeeds if unused and not expired
  const result = await db
    .prepare(
      `UPDATE verification_codes SET used = 1
       WHERE email = ? AND code = ? AND expires_at > ? AND used = 0`
    )
    .bind(normalizedEmail, code, now)
    .run();

  // Clean up expired codes and stale lockout rows opportunistically
  db.prepare("DELETE FROM verification_codes WHERE expires_at < ?")
    .bind(now)
    .run()
    .catch(() => {}); // fire and forget

  db.prepare(
    "DELETE FROM verification_attempts WHERE updated_at < datetime('now', '-1 day')"
  )
    .run()
    .catch(() => {}); // fire and forget

  if (result.meta.changes > 0) {
    // A correct code clears the failure counter.
    await db
      .prepare("DELETE FROM verification_attempts WHERE email = ?")
      .bind(normalizedEmail)
      .run();

    return { ok: true, locked: false };
  }

  return recordFailedAttempt(db, normalizedEmail, now);
}

async function recordFailedAttempt(
  db: D1Database,
  email: string,
  now: number
): Promise<VerifyResult> {
  await db
    .prepare(
      `INSERT INTO verification_attempts (email, failed_count, updated_at)
       VALUES (?, 1, datetime('now'))
       ON CONFLICT(email) DO UPDATE SET
         failed_count = verification_attempts.failed_count + 1,
         updated_at = datetime('now')`
    )
    .bind(email)
    .run();

  const row = await db
    .prepare("SELECT failed_count FROM verification_attempts WHERE email = ?")
    .bind(email)
    .first<{ failed_count: number }>();

  if ((row?.failed_count ?? 0) < MAX_FAILED_ATTEMPTS) {
    return { ok: false, locked: false };
  }

  // Too many misses: lock the address, and burn every live code for it so the
  // guesses already made are worthless once the lockout lifts.
  const lockedUntil = now + LOCKOUT_MINUTES * 60;

  await db
    .prepare(
      `UPDATE verification_attempts
       SET failed_count = 0, locked_until = ?, updated_at = datetime('now')
       WHERE email = ?`
    )
    .bind(lockedUntil, email)
    .run();

  await db
    .prepare(
      "UPDATE verification_codes SET used = 1 WHERE email = ? AND used = 0"
    )
    .bind(email)
    .run();

  return {
    ok: false,
    locked: true,
    retryAfterSeconds: LOCKOUT_MINUTES * 60,
  };
}
