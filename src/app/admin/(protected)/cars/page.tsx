import { prisma } from "@/lib/db";
import Link from "next/link";
import CarsTable from "./CarsTable";

export const dynamic = "force-dynamic";

export default async function AdminCarsPage() {
  const cars = await prisma.car.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Gestion de la flotte</h1>
        <Link href="/admin/cars/new" className="btn-pill btn-red px-5 py-2.5 text-sm">
          + Ajouter un véhicule
        </Link>
      </div>
      <div className="admin-card mt-6 p-6">
        <CarsTable
          cars={cars.map((c) => ({
            id: c.id,
            nameFr: c.nameFr,
            category: c.category,
            transmission: c.transmission,
            seats: c.seats,
            fuel: c.fuel,
            pricePerDay: c.pricePerDay,
            currency: c.currency,
            status: c.status,
          }))}
        />
      </div>
    </div>
  );
}
