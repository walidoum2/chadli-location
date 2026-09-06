import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import CarForm from "../../CarForm";

export const dynamic = "force-dynamic";

export default async function EditCarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = await prisma.car.findUnique({ where: { id } });
  if (!car) notFound();

  let images: string[] = [];
  try {
    images = JSON.parse(car.images) as string[];
  } catch {
    images = [];
  }

  return (
    <div>
      <Link href="/admin/cars" className="text-sm font-semibold text-[var(--red)] hover:underline">
        ← Retour à la flotte
      </Link>
      <h1 className="font-display mt-2 text-2xl">Modifier — {car.nameFr}</h1>
      <CarForm
        initial={{
          id: car.id,
          name: { fr: car.nameFr, ar: car.nameAr || "", en: car.nameEn || "" },
          desc: { fr: car.descFr || "", ar: car.descAr || "", en: car.descEn || "" },
          category: car.category,
          transmission: car.transmission,
          seats: car.seats,
          fuel: car.fuel,
          pricePerDay: car.pricePerDay,
          status: car.status,
          images,
        }}
      />
    </div>
  );
}
