import { prisma } from "@/lib/db";
import ReservationsTable from "./ReservationsTable";

export const dynamic = "force-dynamic";

export default async function AdminReservationsPage() {
  const reservations = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
    include: { car: { select: { nameFr: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-2xl">Réservations</h1>
      <div className="admin-card mt-6 p-6">
        <ReservationsTable
          rows={reservations.map((r) => ({
            id: r.id,
            customerName: r.customerName,
            phone: r.phone,
            email: r.email,
            car: r.car.nameFr,
            pickupAt: r.pickupAt.toISOString(),
            returnAt: r.returnAt.toISOString(),
            pickupLocation: r.pickupLocation,
            status: r.status,
            createdAt: r.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
