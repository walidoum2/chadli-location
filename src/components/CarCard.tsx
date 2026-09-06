import Link from "next/link";
import { carName, type Locale } from "@/lib/i18n";
import type { Car } from "@prisma/client";
import Reveal from "./Reveal";

export function firstImage(car: Car): string {
  try {
    const arr = JSON.parse(car.images) as string[];
    return arr[0] || "";
  } catch {
    return "";
  }
}

export default function CarCard({
  car,
  locale,
  t,
  query = "",
}: {
  car: Car;
  locale: Locale;
  t: Record<string, string>;
  query?: string;
}) {
  const img = firstImage(car);
  const specs = [car.transmission, `${car.seats} places`, car.fuel].join(" · ");

  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-[28px] border border-black/[0.06] bg-gradient-to-b from-white to-[#f1f1f3] px-8 pt-8 transition-transform duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)]">
        <span className="absolute top-6 right-6 rounded-full bg-[var(--red)] px-3.5 py-1.5 text-xs font-bold text-white">
          {t["fleet.badge.available"] || "Disponible"}
        </span>
        <div className="text-[13px] font-semibold uppercase tracking-wide text-[var(--gray)]">
          {car.category}
        </div>
        <div className="font-display mt-1.5 text-2xl text-[var(--black)]">
          {carName(car, locale)}
        </div>
        <div className="mb-5 mt-1 text-sm text-[var(--text-2)]">{specs}</div>
        {img && (
          <div className="-mx-8 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img}
              alt={carName(car, locale)}
              className="block w-full drop-shadow-[0_20px_20px_rgba(0,0,0,0.15)]"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt="" aria-hidden className="car-reflect block w-full" />
          </div>
        )}
        <div className="mt-2 flex items-center justify-between border-t border-black/[0.07] py-6">
          <div className="text-lg font-bold text-[var(--black)]">
            {car.pricePerDay.toLocaleString("fr-FR")} {car.currency}{" "}
            <span className="text-[13px] font-normal text-[var(--text-2)]">
              {t["fleet.perDay"] || "/ jour"}
            </span>
          </div>
          <Link
            href={`/${locale}/flotte/${car.id}${query}`}
            className="btn-pill bg-[var(--black)] px-5 py-2.5 text-[13.5px] text-white hover:bg-[var(--red)]"
          >
            {t["fleet.choose"] || "Choisir"}
          </Link>
        </div>
      </div>
    </Reveal>
  );
}
