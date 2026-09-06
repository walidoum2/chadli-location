import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// { "hero.title.line1": { fr: "...", ar: "...", en: "" }, ... }
const contentSchema = z.record(
  z.string().min(1).max(120),
  z.object({
    fr: z.string().max(2000),
    ar: z.string().max(2000).optional(),
    en: z.string().max(2000).optional(),
  })
);

// PUT /api/admin/content — upsert site content keys (fr required, ar/en optional).
export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const parsed = contentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Données invalides." },
      { status: 400 }
    );
  }

  for (const [key, v] of Object.entries(parsed.data)) {
    await prisma.siteContent.upsert({
      where: { key },
      update: {
        valueFr: v.fr,
        valueAr: v.ar?.trim() ? v.ar : null,
        valueEn: v.en?.trim() ? v.en : null,
      },
      create: {
        key,
        valueFr: v.fr,
        valueAr: v.ar?.trim() ? v.ar : null,
        valueEn: v.en?.trim() ? v.en : null,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
