import { NextResponse } from "next/server";
import { bookingSchema } from "@/lib/validation";
import { hit, clientIp } from "@/lib/rate-limit";
import { carIsBooked } from "@/lib/availability";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  // Rate limit: 3/min per IP
  const ip = clientIp(req.headers);
  const rl = hit(`booking:${ip}`, 3, 60_000, 5 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Trop de demandes. Réessayez dans quelques minutes." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  // Honeypot FIRST (before Zod): real bots send garbage everywhere, so the
  // hidden field must be checked before validation to keep the drop silent.
  const rawBody = body as { website?: unknown };
  if (typeof rawBody?.website === "string" && rawBody.website.length > 0) {
    return NextResponse.json({ ok: true }); // pretend success, save nothing
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Données invalides." },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // Car must exist and be available
  const car = await prisma.car.findUnique({ where: { id: data.carId } });
  if (!car || car.status !== "available") {
    return NextResponse.json(
      { error: "Ce véhicule n'est pas disponible." },
      { status: 400 }
    );
  }

  // Double-booking guard (re-check server-side inside the transaction)
  const booked = await carIsBooked(car.id, {
    pickupAt: data.pickupAt,
    returnAt: data.returnAt,
  });
  if (booked) {
    return NextResponse.json(
      { error: "Ce véhicule est déjà réservé pour ces dates." },
      { status: 409 }
    );
  }

  await prisma.reservation.create({
    data: {
      carId: car.id,
      customerName: data.customerName,
      phone: data.phone,
      email: data.email || null,
      pickupAt: data.pickupAt,
      returnAt: data.returnAt,
      pickupLocation: data.pickupLocation,
      status: "pending",
    },
  });

  return NextResponse.json({ ok: true });
}
