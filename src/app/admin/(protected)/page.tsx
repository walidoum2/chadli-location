import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const [cars, totalRes, pendingRes, confirmedRes, newMessages] = await Promise.all([
    prisma.car.count(),
    prisma.reservation.count(),
    prisma.reservation.count({ where: { status: "pending" } }),
    prisma.reservation.count({ where: { status: "confirmed" } }),
    prisma.contactMessage.count({ where: { read: false, createdAt: { gte: weekAgo } } }),
  ]);

  const cards = [
    { label: "Véhicules", value: cars, href: "/admin/cars" },
    { label: "Réservations actives", value: confirmedRes, href: "/admin/reservations" },
    { label: "En attente", value: pendingRes, href: "/admin/reservations" },
    { label: "Nouveaux messages (7j)", value: newMessages, href: "/admin/messages" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl">Tableau de bord</h1>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="admin-card p-6 transition-shadow hover:shadow-lg">
            <div className="text-4xl font-bold tracking-tight">{c.value}</div>
            <div className="mt-1 text-sm text-[var(--text-2)]">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="admin-card mt-8 p-6">
        <h2 className="text-lg font-bold">Dernières réservations</h2>
        <LatestReservations />
      </div>
    </div>
  );
}

async function LatestReservations() {
  const rows = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { car: { select: { nameFr: true } } },
  });
  if (rows.length === 0) {
    return <p className="mt-3 text-sm text-[var(--text-2)]">Aucune réservation pour le moment.</p>;
  }
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-[var(--gray)]">
            <th className="pb-2">Client</th>
            <th className="pb-2">Véhicule</th>
            <th className="pb-2">Du</th>
            <th className="pb-2">Au</th>
            <th className="pb-2">Statut</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-black/[0.06]">
              <td className="py-2.5">{r.customerName}</td>
              <td className="py-2.5">{r.car.nameFr}</td>
              <td className="py-2.5">{r.pickupAt.toLocaleDateString("fr-FR")}</td>
              <td className="py-2.5">{r.returnAt.toLocaleDateString("fr-FR")}</td>
              <td className="py-2.5">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  r.status === "pending" ? "bg-amber-100 text-amber-700" :
                  r.status === "confirmed" ? "bg-green-100 text-green-700" :
                  r.status === "cancelled" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
