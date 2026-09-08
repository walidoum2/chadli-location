import "server-only";
import { createHash, createHmac, timingSafeEqual, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./db";

export const SESSION_COOKIE = "chadli_admin_session";
const SESSION_TTL_SEC = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("SESSION_SECRET or NEXTAUTH_SECRET must be set");
  return secret;
}

function b64url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function hmac(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function sign(payload: string): string {
  return b64url(payload) + "." + hmac(payload);
}

/**
 * Password version stamp: changing the admin password invalidates every
 * previously issued session token (they carry the old pv and fail here).
 */
function passwordVersion(passwordHash: string): string {
  return createHash("sha256").update(passwordHash).digest("hex").slice(0, 12);
}

function verifyToken(token: string): { email: string; pv: string } | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, mac] = parts;

  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return null;
  }

  const expected = hmac(payload);
  const a = Buffer.from(mac, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(payload) as { email: string; exp: number; pv: string };
    if (!data.exp || Date.now() > data.exp) return null;
    if (!data.pv) return null;
    return { email: data.email, pv: data.pv };
  } catch {
    return null;
  }
}

export async function createSession(email: string): Promise<void> {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) throw new Error("Admin not found");

  const payload = JSON.stringify({
    email,
    exp: Date.now() + SESSION_TTL_SEC * 1000,
    jti: randomBytes(8).toString("hex"), // uniqueness
    pv: passwordVersion(admin.passwordHash),
  });
  const token = sign(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SEC,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Server-side guard for admin pages and API routes. */
export async function getAdminSession(): Promise<{ email: string } | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = verifyToken(token);
  if (!session) return null;

  // Verify the admin still exists AND the password hasn't changed since
  // this token was issued (revokes all sessions on password change).
  const admin = await prisma.admin.findUnique({ where: { email: session.email } });
  if (!admin) return null;
  if (passwordVersion(admin.passwordHash) !== session.pv) return null;

  return { email: session.email };
}
