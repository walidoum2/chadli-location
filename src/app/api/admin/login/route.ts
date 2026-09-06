import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validation";
import { hit, clientIp } from "@/lib/rate-limit";
import { createSession } from "@/lib/auth";
import { verifyCsrf } from "@/lib/csrf";
import { prisma } from "@/lib/db";

// Login: max 5 attempts / 15 min / IP, then 15 min lockout.
export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const rl = hit(`login:${ip}`, 5, 15 * 60_000, 15 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: `Trop de tentatives. Réessayez dans ${Math.ceil(rl.retryAfterSec / 60)} minute(s).`,
      },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  // Honeypot FIRST (before Zod) so the drop stays silent even for garbage bots.
  const rawBody = body as { website?: unknown };
  if (typeof rawBody?.website === "string" && rawBody.website.length > 0) {
    return NextResponse.json({ ok: true }); // pretend success, do nothing
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email ou mot de passe invalide." }, { status: 400 });
  }
  const data = parsed.data;

  // CSRF double-submit: token travels in the x-csrf-token header and is
  // verified against the HttpOnly chadli_csrf cookie.
  const csrfToken = req.headers.get("x-csrf-token");
  if (!csrfToken || !(await verifyCsrf(csrfToken))) {
    return NextResponse.json({ error: "Session expirée. Rechargez la page." }, { status: 403 });
  }

  const admin = await prisma.admin.findUnique({
    where: { email: data.email.toLowerCase() },
  });
  const valid = admin
    ? await bcrypt.compare(data.password, admin.passwordHash)
    : // Run a dummy compare so timing doesn't reveal whether the email exists
      bcrypt.compare(data.password, "$2a$12$C6UzMDM.H6dfI/f/IKcEeO7ZBk0H3F4WlZ0kQe5Yh2R3J4K5L6M7O");

  if (!admin || !valid) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
  }

  await createSession(admin.email);
  return NextResponse.json({ ok: true });
}
