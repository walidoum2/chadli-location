import { headers } from "next/headers";
import {
  getSiteContent,
  isLocale,
  DEFAULT_LOCALE,
  agencyList,
} from "@/lib/i18n";
import { availableCars, type AvailabilityWindow } from "@/lib/availability";
import CarCard from "@/components/CarCard";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export default async function FlottePage({
  searchParams,
}: {
  searchParams: Promise<{ lieu?: string; depart?: string; retour?: string }>;
}) {
  const h = await headers();
  const raw = h.get("x-chadli-locale");
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = await getSiteContent(locale);
  const sp = await searchParams;

  // Functional search: only when both dates are valid ISO datetimes.
  let window: AvailabilityWindow | undefined;
  let searchNote = "";
  if (sp.depart && sp.retour) {
    const depart = new Date(sp.depart);
    const retour = new Date(sp.retour);
    if (!isNaN(depart.getTime()) && !isNaN(retour.getTime()) && retour > depart) {
      window = { pickupAt: depart, returnAt: retour };
      searchNote = `${sp.lieu ? sp.lieu + " · " : ""}${depart.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })} → ${retour.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}`;
    }
  }

  const cars = await availableCars(window);
  const query = window
    ? `?depart=${encodeURIComponent(sp.depart!)}&retour=${encodeURIComponent(sp.retour!)}&lieu=${encodeURIComponent(sp.lieu || "")}`
    : "";

  return (
    <section
      className="min-h-screen px-6 pt-32 pb-24 md:px-12"
      style={{
        background:
          "linear-gradient(180deg, var(--black) 0%, var(--off) 10%, var(--off) 100%)",
      }}
    >
      <Reveal className="mx-auto mb-6 max-w-[700px] text-center">
        <h1 className="font-display text-4xl text-white md:text-[52px]">
          {t["fleet.title"] || "Véhicules disponibles"}
        </h1>
        <p className="mt-4 text-[17px] text-white/55">
          {t["fleet.subtitle"] || ""}
        </p>
      </Reveal>
      {searchNote && (
        <p className="mb-10 text-center text-sm text-white/50">
          🔎 {searchNote}
        </p>
      )}
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-7 md:grid-cols-3">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} locale={locale} t={t} query={query} />
        ))}
        {cars.length === 0 && (
          <div className="col-span-full rounded-[18px] border border-black/10 bg-white p-10 text-center text-[var(--text-2)]">
            Aucun véhicule ne correspond à ces dates. Essayez une autre période.
          </div>
        )}
      </div>
    </section>
  );
}
