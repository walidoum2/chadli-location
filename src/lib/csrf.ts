import "server-only";
import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import { cookies } from "next/headers";

const CSRF_COOKIE = "chadli_csrf";

function getSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("SESSION_SECRET or NEXTAUTH_SECRET must be set");
  return secret;
}

function hmac(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

/**
 * Ensure the CSRF cookie exists (safe from Server Components — only reads
 * next/headers, never writes) and return the HMAC-signed token for forms.
 *
 * Double-submit pattern: random token in an HttpOnly cookie + HMAC(token)
 * embedded in the form. POST handlers compare hmac(cookie) === submitted.
 *
 * Cookie issuance happens in middleware.ts (cookies can't be set from a
 * server component render), so this always finds a token in practice.
 */
export async function ensureCsrfToken(): Promise<string> {
  const store = await cookies();
  const token = store.get(CSRF_COOKIE)?.value;
  if (!token) {
    // No cookie yet (first render before middleware sets it, or static render).
    // Return the HMAC of a sessionless marker so the form still renders;
    // the token rotates on the next full page load.
    return hmac("no-cookie");
  }

  return hmac(token);
}

/** Verify a submitted form token against the CSRF cookie. */
export async function verifyCsrf(submitted: unknown): Promise<boolean> {
  if (typeof submitted !== "string" || !submitted) return false;
  const store = await cookies();
  const token = store.get(CSRF_COOKIE)?.value;
  if (!token) return false;
  const expected = hmac(token);
  const a = Buffer.from(submitted, "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
