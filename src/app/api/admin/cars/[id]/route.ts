import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { carSchema } from "@/lib/validation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// PUT /api/admin/cars/[id] — update a car (also used by the quick status toggle,
// which sends only { status } — partial updates merge over the existing row).
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const existing = await prisma.car.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Véhicule introuvable." }, { status: 404 });
  }

  // Quick-toggle sends only { status }; full form sends the whole carSchema.
  const isPartial =
    typeof body === "object" &&
    body !== null &&
    Object.keys(body as Record<string, unknown>).length === 1 &&
    "status" in (body as Record<string, unknown>);

  if (isPartial) {
    const status = (body as { status: unknown }).status;
    if (status !== "available" && status !== "unavailable") {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }
    await prisma.car.update({ where: { id }, data: { status } });
    return NextResponse.json({ ok: true });
  }

  const parsed = carSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Données invalides." },
      { status: 400 }
    );
  }
  const d = parsed.data;

  await prisma.car.update({
    where: { id },
    data: {
      nameFr: d.name.fr,
      nameAr: d.name.ar || null,
      nameEn: d.name.en || null,
      descFr: d.desc.fr || null,
      descAr: d.desc.ar || null,
      descEn: d.desc.en || null,
      category: d.category,
      transmission: d.transmission,
      seats: d.seats,
      fuel: d.fuel,
      pricePerDay: d.pricePerDay,
      status: d.status,
      images: JSON.stringify(d.images),
    },
  });

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/cars/[id] — delete a car (reservations cascade)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.car.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Véhicule introuvable." }, { status: 404 });
  }

  await prisma.car.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
