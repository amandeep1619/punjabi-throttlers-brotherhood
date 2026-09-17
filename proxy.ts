import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "./lib/session-config";
import { verifySession } from "./lib/jwt";

// Next.js 16: `middleware` is deprecated in favor of `proxy`, which always
// runs on the Node.js runtime (not Edge) — so jsonwebtoken works directly
// here with no separate Edge-safe verifier needed.

const PUBLIC_PAGES = new Set(["/", "/join", "/login", "/policies"]);
const PUBLIC_API_PREFIXES = ["/api/auth/", "/api/join"];
// Pages that only make sense for a logged-out visitor — an already-logged-in
// user gets bounced home instead of seeing the login/join form again.
const GUEST_ONLY_PAGES = new Set(["/login", "/join"]);

function isAdminPath(pathname: string): boolean {
  return pathname.startsWith("/manage-") || pathname.startsWith("/api/manage-");
}

function isPublic(pathname: string): boolean {
  if (PUBLIC_PAGES.has(pathname)) return true;
  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;

  if (session && GUEST_ONLY_PAGES.has(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isPublic(pathname)) return NextResponse.next();

  if (!session) {
    if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminPath(pathname) && session.role !== "admin") {
    if (isApi) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/|uploads/).*)"],
};
