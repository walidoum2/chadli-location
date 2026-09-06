"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CarRow {
  id: string;
  nameFr: string;
  category: string;
  transmission: string;
  seats: number;
  fuel: string;
  pricePerDay: number;
  currency: string;
  status: string;
}

export default function CarsTable({ cars }: { cars: CarRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function remove(id: string, name: string) {
    if (!confirm(`Supprimer « ${name} » ? Cette action est définitive.`)) return;
    setBusy(id);
    await fetch(`/api/admin/cars/${id}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  }

  async function toggleStatus(car: CarRow) {
    setBusy(car.id);
    await fetch(`/api/admin/cars/${car.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: car.status === "available" ? "unavailable" : "available" }),
    });
    setBusy(null);
    router.refresh();
  }

  if (cars.length === 0) {
    return <p className="text-sm text-[var(--text-2)]">Aucun véhicule. Ajoutez-en un.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-[var(--gray)]">
            <th className="pb-3">Nom</th>
            <th className="pb-3">Catégorie</th>
            <th className="pb-3">Boîte</th>
            <th className="pb-3">Places</th>
            <th className="pb-3">Prix/jour</th>
            <th className="pb-3">Statut</th>
            <th className="pb-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {cars.map((c) => (
            <tr key={c.id} className="border-t border-black/[0.06]">
              <td className="py-3 font-semibold">{c.nameFr}</td>
              <td className="py-3">{c.category}</td>
              <td className="py-3">{c.transmission}</td>
              <td className="py-3">{c.seats}</td>
              <td className="py-3">{c.pricePerDay.toLocaleString("fr-FR")} {c.currency}</td>
              <td className="py-3">
                <button
                  onClick={() => toggleStatus(c)}
                  disabled={busy === c.id}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    c.status === "available"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {c.status === "available" ? "Disponible" : "Indisponible"}
                </button>
              </td>
              <td className="py-3 text-right">
                <Link href={`/admin/cars/${c.id}/edit`} className="mr-4 font-semibold text-[var(--red)] hover:underline">
                  Modifier
                </Link>
                <button
                  onClick={() => remove(c.id, c.nameFr)}
                  disabled={busy === c.id}
                  className="font-semibold text-[var(--text-2)] hover:text-[var(--red)]"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
