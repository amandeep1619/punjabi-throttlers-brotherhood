// Edge-safe: no Node-only imports here, since middleware.ts (Edge runtime) needs these too.

export type SessionPayload = {
  userId: string;
  role: "member" | "admin";
};

export const SESSION_COOKIE = "pt_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
  secure: process.env.NODE_ENV === "production",
};
