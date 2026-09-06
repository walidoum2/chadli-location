import { notFound } from "next/navigation";
import { headers } from "next/headers";
import {
  getSiteContent,
  carName,
  carDesc,
  agencyList,
  isLocale,
  DEFAULT_LOCALE,
} from "@/lib/i18n";
import { prisma } from "@/lib/db";
import BookingForm from "@/components/BookingForm";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = await getSiteContent(locale);

  const car = await prisma.car.findUnique({ where: { id } });
  if (!car) notFound();

  let images: string[] = [];
  try {
    images = JSON.parse(car.images) as string[];
  } catch {
    images = [];
  }

  return (
    <section
      className="min-h-screen px-6 pt-32 pb-24 md:px-12"
      style={{
        background:
          "linear-gradient(180deg, var(--black) 0%, var(--off) 14%, var(--off) 100%)",
      }}
    >
      <div className="mx-auto max-w-[1240px]">
        <Reveal>
          <div className="text-[13px] font-semibold uppercase tracking-wide text-white/50">
            {car.category}
          </div>
          <h1 className="font-display mt-2 text-4xl text-white md:text-6xl">
            {carName(car, locale)}
          </h1>
          <p className="mt-3 max-w-[640px] text-[16px] text-white/55">
            {carDesc(car, locale)}
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* Gallery */}
          <Reveal>
            {images[0] && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={images[0]}
                alt={carName(car, locale)}
                className="w-full rounded-[28px] object-cover shadow-2xl"
              />
            )}
            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {images.slice(1, 5).map((src, i) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="h-20 w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            )}
          </Reveal>

          {/* Info + booking */}
          <Reveal delayMs={150}>
            <div className="rounded-[28px] border border-black/[0.06] bg-white p-8">
              <div className="text-2xl font-bold text-[var(--black)]">
                {car.pricePerDay.toLocaleString("fr-FR")} {car.currency}
                <span className="ml-1 text-sm font-normal text-[var(--text-2)]">
                  {t["fleet.perDay"] || "/ jour"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-[var(--text-2)]">
                <span className="rounded-full bg-black/[0.05] px-3 py-1">{car.transmission}</span>
                <span className="rounded-full bg-black/[0.05] px-3 py-1">{car.seats} places</span>
                <span className="rounded-full bg-black/[0.05] px-3 py-1">{car.fuel}</span>
                <span className="rounded-full bg-black/[0.05] px-3 py-1">{car.status === "available" ? (t["fleet.badge.available"] || "Disponible") : "Indisponible"}</span>
              </div>

              <h2 className="font-display mt-8 text-xl text-[var(--black)]">
                {t["booking.title"] || "Réserver ce véhicule"}
              </h2>
              <BookingForm
                carId={car.id}
                locale={locale}
                locations={agencyList(t)}
                labels={{
                  name: t["booking.name"] || "Nom complet",
                  phone: t["booking.phone"] || "Téléphone",
                  email: t["booking.email"] || "Email (optionnel)",
                  place: t["search.pickup.label"] || "Lieu de retrait",
                  depart: t["search.depart.label"] || "Départ",
                  retour: t["search.retour.label"] || "Retour",
                  submit: t["booking.submit"] || "Demander la réservation",
                  success: t["booking.success"] || "Demande envoyée !",
                }}
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
