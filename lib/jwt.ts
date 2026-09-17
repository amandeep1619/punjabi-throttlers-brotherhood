// Pure — no Next-specific imports, so this is safe to use from proxy.ts,
// Route Handlers, and standalone scripts alike.
import jwt from "jsonwebtoken";
import { SESSION_MAX_AGE_SECONDS, type SessionPayload } from "./session-config";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not set in the environment");

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, {
    algorithm: "HS256",
    expiresIn: SESSION_MAX_AGE_SECONDS,
  });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET as string, { algorithms: ["HS256"] }) as SessionPayload;
  } catch {
    return null;
  }
}
