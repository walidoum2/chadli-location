import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { hit, clientIp } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const rl = hit(`contact:${ip}`, 3, 60_000, 5 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Trop de messages. Réessayez dans quelques minutes." },
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
    return NextResponse.json({ ok: true }); // pretend success, save nothing
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Données invalides." },
      { status: 400 }
    );
  }
  const data = parsed.data;

  await prisma.contactMessage.create({
    data: { name: data.name, email: data.email, message: data.message },
  });

  return NextResponse.json({ ok: true });
}
