"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export interface CarFormData {
  id?: string;
  name: { fr: string; ar: string; en: string };
  desc: { fr: string; ar: string; en: string };
  category: string;
  transmission: string;
  seats: number;
  fuel: string;
  pricePerDay: number;
  status: string;
  images: string[];
}

const TABS: Array<{ code: Locale; label: string }> = [
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
  { code: "en", label: "English" },
];

const CATS = ["Citadine", "Berline", "SUV", "Luxe"];
const TRANSMISSIONS = ["Manuelle", "Automatique"];
const FUELS = ["Diesel", "Essence", "Hybride", "Electrique"];

export default function CarForm({ initial }: { initial?: CarFormData }) {
  const router = useRouter();
  const [tab, setTab] = useState<Locale>("fr");
  const [name, setName] = useState(initial?.name || { fr: "", ar: "", en: "" });
  const [desc, setDesc] = useState(initial?.desc || { fr: "", ar: "", en: "" });
  const [category, setCategory] = useState(initial?.category || "Citadine");
  const [transmission, setTransmission] = useState(initial?.transmission || "Manuelle");
  const [seats, setSeats] = useState(initial?.seats ?? 5);
  const [fuel, setFuel] = useState(initial?.fuel || "Diesel");
  const [price, setPrice] = useState(initial?.pricePerDay ?? 5000);
  const [status, setStatus] = useState(initial?.status || "available");
  const [images, setImages] = useState<string[]>(initial?.images || []);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadErr("");
    for (const f of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.path) {
        setImages((prev) => [...prev, j.path].slice(0, 12));
      } else {
        setUploadErr(j.error || "Échec de l'envoi.");
      }
    }
    setUploading(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.fr.trim()) {
      setError("Le nom (français) est obligatoire.");
      setTab("fr");
      return;
    }
    setSaving(true);
    const payload = {
      name: { fr: name.fr, ar: name.ar || "", en: name.en || "" },
      desc: { fr: desc.fr, ar: desc.ar || "", en: desc.en || "" },
      category,
      transmission,
      seats,
      fuel,
      pricePerDay: price,
      status,
      images,
    };
    const res = await fetch(
      initial?.id ? `/api/admin/cars/${initial.id}` : "/api/admin/cars",
      {
        method: initial?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (res.ok) {
      router.push("/admin/cars");
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Erreur d'enregistrement.");
      setSaving(false);
    }
  }

  const inputCls =
    "mt-1 w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--red)]";
  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-[var(--text-2)]";

  return (
    <form onSubmit={save} className="admin-card mt-6 max-w-[760px] p-6">
      {/* Language tabs — fr/ar/en per field, blank ar/en falls back to fr on the site */}
      <div className="mb-5 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.code}
            type="button"
            onClick={() => setTab(t.code)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              tab === t.code ? "bg-[var(--black)] text-white" : "bg-black/[0.06] text-[var(--text-2)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <label className={labelCls}>Nom ({tab.toUpperCase()})</label>
          <input
            value={name[tab]}
            onChange={(e) => setName({ ...name, [tab]: e.target.value })}
            className={inputCls}
            dir={tab === "ar" ? "rtl" : "ltr"}
            required={tab === "fr"}
          />
        </div>
        <div>
          <label className={labelCls}>Description ({tab.toUpperCase()})</label>
          <textarea
            value={desc[tab]}
            onChange={(e) => setDesc({ ...desc, [tab]: e.target.value })}
            rows={3}
            className={inputCls}
            dir={tab === "ar" ? "rtl" : "ltr"}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Catégorie</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
            {CATS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Boîte de vitesses</label>
          <select value={transmission} onChange={(e) => setTransmission(e.target.value)} className={inputCls}>
            {TRANSMISSIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Places</label>
          <input type="number" min={2} max={9} value={seats} onChange={(e) => setSeats(Number(e.target.value))} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Carburant</label>
          <select value={fuel} onChange={(e) => setFuel(e.target.value)} className={inputCls}>
            {FUELS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Prix / jour (DA)</label>
          <input type="number" min={500} step={100} value={price} onChange={(e) => setPrice(Number(e.target.value))} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Statut</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
            <option value="available">Disponible</option>
            <option value="unavailable">Indisponible</option>
          </select>
        </div>
      </div>

      {/* Photos */}
      <div className="mt-6">
        <label className={labelCls}>Photos (JPG/PNG/WebP, max 5 Mo)</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => upload(e.target.files)}
          className="mt-1 block text-sm"
        />
        {uploading && <p className="mt-2 text-sm text-[var(--gray)]">Envoi en cours...</p>}
        {uploadErr && <p className="mt-2 text-sm text-[var(--red)]">{uploadErr}</p>}
        {images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {images.map((src, i) => (
              <div key={src} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-20 w-28 rounded-xl object-cover" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, j) => j !== i))}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--red)] text-xs text-white"
                  aria-label="Retirer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-[var(--red)]">{error}</p>}
      <div className="mt-6 flex gap-3">
        <button type="submit" disabled={saving} className="btn-pill btn-red px-7 py-2.5 text-sm disabled:opacity-60">
          {saving ? "..." : "Enregistrer"}
        </button>
        <button type="button" onClick={() => router.push("/admin/cars")} className="btn-pill bg-black/[0.06] px-7 py-2.5 text-sm">
          Annuler
        </button>
      </div>
    </form>
  );
}
