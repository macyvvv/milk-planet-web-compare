import "server-only";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { generateSessionToken, hashToken } from "./tokens";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface RequestContext {
  ipAddress: string | null;
  userAgent: string | null;
}

export async function getRequestContext(): Promise<RequestContext> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  return {
    ipAddress: forwardedFor ? forwardedFor.split(",")[0].trim() : null,
    userAgent: h.get("user-agent"),
  };
}

/**
 * Issues a brand new session for the given user and sets it as an HttpOnly cookie.
 * Always creates a fresh token (never reuses one) — this is the session rotation guarantee
 * required by system_spec.md 6章 (a new session identifier per login, mitigating fixation).
 */
export async function createSession(userId: string): Promise<void> {
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const { ipAddress, userAgent } = await getRequestContext();

  await db.session.create({
    data: { userId, tokenHash, expiresAt, ipAddress, userAgent },
  });

  const cookieStore = await cookies();
  cookieStore.set(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export interface CurrentSession {
  sessionId: string;
  userId: string;
}

/**
 * Verifies the session cookie against the database (a "secure" check per Next.js auth
 * guidance, as opposed to trusting an unsigned optimistic cookie value). Touches
 * last_seen_at but does not extend expires_at (fixed-lifetime session).
 */
export async function readSession(): Promise<CurrentSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await db.session.findUnique({ where: { tokenHash } });

  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    return null;
  }

  // Fire-and-forget telemetry touch; failure here must never block the request.
  db.session
    .update({ where: { id: session.id }, data: { lastSeenAt: new Date() } })
    .catch(() => {});

  return { sessionId: session.id, userId: session.userId };
}

export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;
  if (token) {
    await db.session.updateMany({
      where: { tokenHash: hashToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  cookieStore.delete(env.SESSION_COOKIE_NAME);
}

/**
 * Revokes every active session for a user. Required on password change/reset
 * (REQ-AUTH-007, REQ-AUTH-009) and admin-initiated lock.
 */
export async function revokeAllSessionsForUser(
  userId: string,
  client: { session: typeof db.session } = db,
): Promise<void> {
  await client.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
