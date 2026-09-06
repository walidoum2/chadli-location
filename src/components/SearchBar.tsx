"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface SearchDefaults {
  locations: string[];
  labels: { place: string; depart: string; retour: string };
  locale: string;
}

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SearchBar({ defaults }: { defaults: SearchDefaults }) {
  const router = useRouter();
  const [place, setPlace] = useState(defaults.locations[0] || "Alger — Aéroport");
  const now = new Date();
  const depart = new Date(now.getTime() + 24 * 3600 * 1000);
  const retour = new Date(now.getTime() + 4 * 24 * 3600 * 1000);
  const [d1, setD1] = useState(toLocalInput(depart));
  const [d2, setD2] = useState(toLocalInput(retour));
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!d1 || !d2) {
      setError("Veuillez choisir les deux dates.");
      return;
    }
    if (new Date(d2) <= new Date(d1)) {
      setError("Le retour doit être après le départ.");
      return;
    }
    const params = new URLSearchParams({
      lieu: place,
      depart: new Date(d1).toISOString(),
      retour: new Date(d2).toISOString(),
    });
    router.push(`/${defaults.locale}/flotte?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className="w-full max-w-[980px] mx-auto" dir="ltr">
      <div className="glass rounded-[100px] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.5)] max-md:rounded-[24px]">
        <div className="grid grid-cols-[1.1fr_1fr_1fr_auto] items-center max-md:grid-cols-1">
          <label className="search-field border-r border-white/10 max-md:border-r-0 max-md:border-b">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--gray)]">
              {defaults.labels.place}
            </span>
            <select
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-white outline-none [&>option]:text-black"
            >
              {defaults.locations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </label>
          <label className="search-field border-r border-white/10 px-5 py-2.5 text-left max-md:border-r-0 max-md:border-b">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--gray)]">
              {defaults.labels.depart}
            </span>
            <input
              type="datetime-local"
              value={d1}
              onChange={(e) => setD1(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-white outline-none [color-scheme:dark]"
            />
          </label>
          <label className="search-field px-5 py-2.5 text-left max-md:border-b">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--gray)]">
              {defaults.labels.retour}
            </span>
            <input
              type="datetime-local"
              value={d2}
              onChange={(e) => setD2(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-white outline-none [color-scheme:dark]"
            />
          </label>
          <button
            type="submit"
            aria-label="Rechercher"
            className="ml-2 flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[var(--red)] text-white transition-all hover:scale-105 hover:shadow-[0_8px_28px_rgba(224,30,38,0.55)] max-md:ml-0 max-md:mt-2 max-md:h-12 max-md:w-full max-md:rounded-[100px]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="h-5 w-5">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
      </div>
      {error && (
        <p className="mt-3 text-center text-sm text-[var(--red)]">{error}</p>
      )}
      <style jsx>{`
        .search-field {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 10px 22px;
          text-align: left;
          cursor: pointer;
        }
        @media (max-width: 767px) {
          .search-field {
            border-right: none;
          }
        }
      `}</style>
    </form>
  );
}
