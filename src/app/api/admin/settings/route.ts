import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminSession } from "@/lib/auth";
import { destroySession, SESSION_COOKIE } from "@/lib/auth";
import { passwordChangeSchema } from "@/lib/validation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// PUT /api/admin/settings
// Body: { mode: "password", currentPassword, newPassword } — changes password.
// Body: { mode: "logo", logoUrl } — updates site logo ("" = default text logo).
export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  if (b.mode === "logo") {
    const url = typeof b.logoUrl === "string" ? b.logoUrl.trim() : "";
    if (url.length > 500) {
      return NextResponse.json({ error: "URL trop longue." }, { status: 400 });
    }
    // Only allow same-origin relative paths or https URLs.
    if (url && !url.startsWith("/uploads/") && !/^https:\/\//.test(url)) {
      return NextResponse.json(
        { error: "URL du logo invalide (https ou /uploads/ uniquement)." },
        { status: 400 }
      );
    }
    await prisma.siteContent.upsert({
      where: { key: "site.logo" },
      update: { valueFr: url, valueAr: null, valueEn: null },
      create: { key: "site.logo", valueFr: url, valueAr: null, valueEn: null },
    });
    return NextResponse.json({ ok: true });
  }

  if (b.mode === "password") {
    const parsed = passwordChangeSchema.safeParse(b);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Mot de passe invalide." },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({ where: { email: session.email } });
    if (!admin) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

    const ok = await bcrypt.compare(parsed.data.currentPassword, admin.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 401 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await prisma.admin.update({
      where: { email: admin.email },
      data: { passwordHash },
    });

    // Force re-login everywhere with the new secret version.
    await destroySession();
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  return NextResponse.json({ error: "Mode inconnu." }, { status: 400 });
}
