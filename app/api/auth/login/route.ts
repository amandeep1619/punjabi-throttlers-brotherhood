import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation/member";
import { findMemberByEmailWithPassword } from "@/lib/queries/members";
import { verifyPassword, signSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { clientIp, isRateLimited } from "@/lib/rateLimit";

const STATUS_MESSAGES: Record<string, string> = {
  pending: "Your account is under review process, you will be notified once its approved",
  banned: "You are banned due to violation of policies",
};

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  if (isRateLimited(`login:${clientIp(request)}`, MAX_ATTEMPTS, WINDOW_MS)) {
    return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password" }, { status: 400 });
  }

  const member = await findMemberByEmailWithPassword(parsed.data.email);
  if (!member) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const validPassword = await verifyPassword(parsed.data.password, member.passwordHash);
  if (!validPassword) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  if (member.status !== "active") {
    return NextResponse.json({ error: STATUS_MESSAGES[member.status] ?? "Account is not active" }, { status: 403 });
  }

  const token = signSession({ userId: member.id, role: member.role });
  const response = NextResponse.json({
    ok: true,
    user: { id: member.id, memberId: member.memberId, name: member.fullName, role: member.role },
  });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
}
