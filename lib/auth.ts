import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, sessionCookieOptions, type SessionPayload } from "./session-config";
import { verifySession } from "./jwt";

export { SESSION_COOKIE, sessionCookieOptions };
export { signSession, verifySession } from "./jwt";
export { hashPassword, verifyPassword } from "./password";

/** Server Components / Route Handlers only (reads the incoming request's cookies). */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

/** Use in Server Components/pages. Route Handlers should check getSession() and return 401/403 themselves. */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireAuth();
  if (session.role !== "admin") redirect("/");
  return session;
}
