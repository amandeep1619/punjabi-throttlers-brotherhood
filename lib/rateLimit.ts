import "server-only";
import type { NextRequest } from "next/server";

// ponytail: in-memory, per-process — resets on redeploy and doesn't share
// state across multiple instances. Fine for this club's single-instance
// deployment; move to a shared store (e.g. Redis) if this ever runs
// horizontally scaled.
const attempts = new Map<string, { count: number; resetAt: number }>();

export function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/** Returns true if `key` has exceeded `max` calls within `windowMs`. */
export function isRateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > max;
}
