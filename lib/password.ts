// No "server-only" guard here (unlike lib/auth.ts) — scripts/seed-admin.ts
// imports this directly via tsx, outside the Next.js server-component bundler.
import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
