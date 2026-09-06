"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Row {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function MessagesList({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [onlyUnread, setOnlyUnread] = useState(false);

  const visible = onlyUnread ? rows.filter((r) => !r.read) : rows;

  async function toggleRead(row: Row) {
    setBusy(row.id);
    await fetch(`/api/admin/messages/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !row.read }),
    });
    setBusy(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce message ?")) return;
    setBusy(id);
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  }

  return (
    <div>
      <label className="flex items-center gap-2 text-sm text-[var(--text-2)]">
        <input
          type="checkbox"
          checked={onlyUnread}
          onChange={(e) => setOnlyUnread(e.target.checked)}
        />
        Afficher uniquement les non-lus ({rows.filter((r) => !r.read).length})
      </label>

      <div className="mt-4 space-y-3">
        {visible.map((m) => (
          <div
            key={m.id}
            className={`admin-card p-5 ${m.read ? "" : "border-l-4 border-l-[var(--red)]"}`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold">{m.name}</span>
              <a href={`mailto:${m.email}`} className="text-sm text-[var(--red)] hover:underline">
                {m.email}
              </a>
              <span className="text-xs text-[var(--gray)]">
                {new Date(m.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
              </span>
              {!m.read && (
                <span className="rounded-full bg-[rgba(224,30,38,0.1)] px-2.5 py-0.5 text-xs font-bold text-[var(--red)]">
                  Nouveau
                </span>
              )}
              <span className="ml-auto flex gap-4">
                <button
                  onClick={() => toggleRead(m)}
                  disabled={busy === m.id}
                  className="text-sm font-semibold text-[var(--text-2)] hover:text-black"
                >
                  {m.read ? "Marquer non lu" : "Marquer lu"}
                </button>
                <button
                  onClick={() => remove(m.id)}
                  disabled={busy === m.id}
                  className="text-sm font-semibold text-[var(--text-2)] hover:text-[var(--red)]"
                >
                  Supprimer
                </button>
              </span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--text-2)]">{m.message}</p>
          </div>
        ))}
        {visible.length === 0 && (
          <p className="admin-card p-6 text-sm text-[var(--text-2)]">Aucun message non lu.</p>
        )}
      </div>
    </div>
  );
}
