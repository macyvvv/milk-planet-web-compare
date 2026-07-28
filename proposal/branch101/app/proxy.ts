import { NextRequest, NextResponse } from "next/server";

// Optimistic check only: presence of the session cookie, not its validity (no DB access here —
// Next.js guidance for database-backed sessions is to keep Proxy to cheap, cookie-only checks).
// The real, authoritative check is lib/modules/auth/dal.ts's getCurrentUser()/requireUser(),
// which every Server Component/Action/Route Handler must call before touching data
// (authorization_matrix.md 0章). This function only prevents an obviously-unauthenticated
// browser from ever reaching a protected page's shell.
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "mp_session";

const PUBLIC_ROUTES = ["/login", "/initial-setup", "/password-reset"];

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSessionCookie = Boolean(req.cookies.get(SESSION_COOKIE_NAME)?.value);
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (pathname === "/") {
    return NextResponse.next();
  }

  if (!isPublicRoute && !hasSessionCookie) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicRoute && hasSessionCookie) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
