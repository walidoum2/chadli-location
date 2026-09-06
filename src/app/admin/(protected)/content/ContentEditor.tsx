"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

type Tri = { fr: string; ar: string; en: string };

const TABS: Array<{ code: Locale; label: string }> = [
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
  { code: "en", label: "English" },
];

const KEY_LABELS: Record<string, string> = {
  "hero.eyebrow": "Héro — surtitre",
  "hero.title.line1": "Héro — titre ligne 1",
  "hero.title.line2": "Héro — titre ligne 2 ({accent}...{/accent} pour le rouge)",
  "hero.subtext": "Héro — sous-titre",
  "search.pickup.label": "Recherche — lieu de retrait",
  "search.depart.label": "Recherche — départ",
  "search.retour.label": "Recherche — retour",
  "fleet.title": "Flotte — titre",
  "fleet.subtitle": "Flotte — sous-titre",
  "fleet.choose": "Flotte — bouton « Choisir »",
  "fleet.perDay": "Flotte — « / jour »",
  "fleet.badge.available": "Flotte — badge disponible",
  "features.title": "Atouts — titre",
  "feature.1.title": "Atout 1 — titre",
  "feature.1.desc": "Atout 1 — description",
  "feature.1.icon": "Atout 1 — icône (check | truck | shield)",
  "feature.2.title": "Atout 2 — titre",
  "feature.2.desc": "Atout 2 — description",
  "feature.2.icon": "Atout 2 — icône",
  "feature.3.title": "Atout 3 — titre",
  "feature.3.desc": "Atout 3 — description",
  "feature.3.icon": "Atout 3 — icône",
  "cta.title": "CTA final — titre",
  "cta.button": "CTA final — bouton",
  "nav.fleet": "Menu — Flotte",
  "nav.rates": "Menu — Tarifs",
  "nav.agencies": "Menu — Agences",
  "nav.contact": "Menu — Contact",
  "nav.book": "Menu — bouton Réserver",
  "contact.title": "Contact — titre",
  "contact.subtitle": "Contact — sous-titre",
  "contact.phone": "Contact — téléphone",
  "contact.whatsapp": "Contact — WhatsApp",
  "contact.email": "Contact — email",
  "contact.address": "Contact — adresse",
  "agencies.list": "Agences (séparées par |)",
  "booking.title": "Réservation — titre",
  "booking.name": "Réservation — nom",
  "booking.phone": "Réservation — téléphone",
  "booking.email": "Réservation — email",
  "booking.submit": "Réservation — bouton",
  "booking.success": "Réservation — message de succès",
  "footer.rights": "Pied de page — droits",
  "footer.about": "Pied de page — présentation",
  "footer.faq": "Menu / pied de page — FAQ",
  "tarifs.title": "Tarifs — titre",
  "tarifs.subtitle": "Tarifs — sous-titre",
  "tarifs.perDay": "Tarifs — « DA / jour »",
  "tarifs.from": "Tarifs — « À partir de »",
  "tarifs.bookBtn": "Tarifs — bouton réserver",
  "tarifs.empty": "Tarifs — catégorie vide",
  "agences.title": "Agences — titre",
  "agences.subtitle": "Agences — sous-titre",
  "agences.hoursLabel": "Agences — libellé horaires",
  "agences.hours": "Agences — horaires",
  "faq.title": "FAQ — titre",
  "faq.subtitle": "FAQ — sous-titre",
  "faq.q1": "FAQ — question 1",
  "faq.a1": "FAQ — réponse 1",
  "faq.q2": "FAQ — question 2",
  "faq.a2": "FAQ — réponse 2",
  "faq.q3": "FAQ — question 3",
  "faq.a3": "FAQ — réponse 3",
  "faq.q4": "FAQ — question 4",
  "faq.a4": "FAQ — réponse 4",
  "faq.q5": "FAQ — question 5",
  "faq.a5": "FAQ — réponse 5",
  "faq.q6": "FAQ — question 6",
  "faq.a6": "FAQ — réponse 6",
  "marquee.brands": "Bandeau défilant — marques (séparées par |)",
  "marquee.label": "Bandeau défilant — libellé au-dessus",
};

const MULTILINE = new Set([
  "hero.subtext",
  "fleet.subtitle",
  "contact.subtitle",
  "contact.address",
  "feature.1.desc",
  "feature.2.desc",
  "feature.3.desc",
  "booking.success",
  "footer.about",
  "tarifs.subtitle",
  "agences.subtitle",
  "faq.subtitle",
  "faq.a1",
  "faq.a2",
  "faq.a3",
  "faq.a4",
  "faq.a5",
  "faq.a6",
  "tarifs.empty",
]);

export default function ContentEditor({ initial }: { initial: Record<string, Tri> }) {
  const router = useRouter();
  const [data, setData] = useState<Record<string, Tri>>(initial);
  const [tab, setTab] = useState<Locale>("fr");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const keys = Object.keys(initial);

  function update(key: string, loc: Locale, value: string) {
    setData((prev) => ({ ...prev, [key]: { ...prev[key], [loc]: value } }));
  }

  async function save() {
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setMsg("Enregistré ✓");
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setMsg(j.error || "Erreur d'enregistrement.");
    }
    setSaving(false);
  }

  const inputCls =
    "mt-1 w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--red)]";
  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-[var(--text-2)]";

  return (
    <div className="mt-6">
      <div className="sticky top-0 z-10 -mx-6 flex items-center justify-between bg-[#f5f5f7] px-6 py-3">
        <div className="flex gap-2">
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
        <div className="flex items-center gap-3">
          {msg && <span className="text-sm font-semibold text-[var(--red)]">{msg}</span>}
          <button
            onClick={save}
            disabled={saving}
            className="btn-pill btn-red px-6 py-2.5 text-sm disabled:opacity-60"
          >
            {saving ? "..." : "Enregistrer tout"}
          </button>
        </div>
      </div>

      <div className="admin-card mt-4 divide-y divide-black/[0.06] p-6">
        {keys.map((key) => {
          const label = KEY_LABELS[key] || key;
          const value = data[key]?.[tab] ?? "";
          const multiline = MULTILINE.has(key);
          return (
            <div key={key} className="py-4 first:pt-0 last:pb-0">
              <label className={labelCls}>{label}</label>
              <p className="mt-0.5 text-[11px] text-[var(--gray)]">{key}</p>
              {multiline ? (
                <textarea
                  value={value}
                  rows={2}
                  onChange={(e) => update(key, tab, e.target.value)}
                  className={inputCls}
                  dir={tab === "ar" ? "rtl" : "ltr"}
                />
              ) : (
                <input
                  value={value}
                  onChange={(e) => update(key, tab, e.target.value)}
                  className={inputCls}
                  dir={tab === "ar" ? "rtl" : "ltr"}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
