"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface Row {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
  car: string;
  pickupAt: string;
  returnAt: string;
  pickupLocation: string;
  status: string;
  createdAt: string;
}

const STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  completed: "Terminée",
  cancelled: "Annulée",
};

const STATUS_CLS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });

export default function ReservationsTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const fromT = from ? new Date(from).getTime() : null;
    const toT = to ? new Date(to).getTime() + 24 * 3600 * 1000 : null; // inclusive day
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (fromT && new Date(r.pickupAt).getTime() < fromT) return false;
      if (toT && new Date(r.pickupAt).getTime() > toT) return false;
      return true;
    });
  }, [rows, statusFilter, from, to]);

  async function setStatus(id: string, status: string) {
    setBusy(id);
    await fetch(`/api/admin/reservations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette réservation ?")) return;
    setBusy(id);
    await fetch(`/api/admin/reservations/${id}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  }

  const inputCls =
    "rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--red)]";

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={inputCls}
        >
          <option value="all">Tous les statuts</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-[var(--text-2)]">
          Du
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--text-2)]">
          Au
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
        </label>
        {(statusFilter !== "all" || from || to) && (
          <button
            onClick={() => { setStatusFilter("all"); setFrom(""); setTo(""); }}
            className="text-sm font-semibold text-[var(--red)] hover:underline"
          >
            Réinitialiser
          </button>
        )}
        <span className="ml-auto text-sm text-[var(--gray)]">{filtered.length} résultat(s)</span>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--text-2)]">Aucune réservation ne correspond.</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[var(--gray)]">
                <th className="pb-3">Client</th>
                <th className="pb-3">Contact</th>
                <th className="pb-3">Véhicule</th>
                <th className="pb-3">Période</th>
                <th className="pb-3">Lieu</th>
                <th className="pb-3">Statut</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-black/[0.06] align-top">
                  <td className="py-3 font-semibold">{r.customerName}</td>
                  <td className="py-3 text-[var(--text-2)]">
                    <div>{r.phone}</div>
                    {r.email && <div className="text-xs">{r.email}</div>}
                  </td>
                  <td className="py-3">{r.car}</td>
                  <td className="py-3 text-[var(--text-2)]">
                    {fmt(r.pickupAt)}
                    <br />→ {fmt(r.returnAt)}
                  </td>
                  <td className="py-3 text-[var(--text-2)]">{r.pickupLocation}</td>
                  <td className="py-3">
                    <select
                      value={r.status}
                      disabled={busy === r.id}
                      onChange={(e) => setStatus(r.id, e.target.value)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold outline-none ${STATUS_CLS[r.status] || "bg-gray-100"}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => remove(r.id)}
                      disabled={busy === r.id}
                      className="text-sm font-semibold text-[var(--text-2)] hover:text-[var(--red)]"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
