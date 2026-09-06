import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { carSchema } from "@/lib/validation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST /api/admin/cars — create a car
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const parsed = carSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Données invalides." },
      { status: 400 }
    );
  }
  const d = parsed.data;

  const car = await prisma.car.create({
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

  return NextResponse.json({ ok: true, id: car.id });
}
