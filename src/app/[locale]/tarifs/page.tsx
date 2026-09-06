import { headers } from "next/headers";
import {
  getSiteContent,
  isLocale,
  DEFAULT_LOCALE,
  type Locale,
} from "@/lib/i18n";
import { prisma } from "@/lib/db";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

const CATS = ["Citadine", "Berline", "SUV", "Luxe"] as const;

export default async function TarifsPage() {
  const h = await headers();
  const raw = h.get("x-chadli-locale");
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = await getSiteContent(locale);

  const cars = await prisma.car.findMany({ where: { status: "available" } });

  const groups = CATS.map((cat) => {
    const inCat = cars.filter((c) => c.category === cat);
    const min = inCat.length
      ? inCat.reduce((m, c) => Math.min(m, c.pricePerDay), Infinity)
      : null;
    return { cat, count: inCat.length, min };
  });

  return (
    <section
      className="min-h-screen px-6 pt-32 pb-24 md:px-12"
      style={{
        background:
          "linear-gradient(180deg, var(--black) 0%, var(--off) 10%, var(--off) 100%)",
      }}
    >
      <div className="mx-auto max-w-[1000px]">
        <Reveal className="text-center">
          <h1 className="font-display text-4xl text-white md:text-5xl">
            {t["tarifs.title"] || "Nos tarifs"}
          </h1>
          <p className="mx-auto mt-4 max-w-[560px] text-[17px] text-white/55">
            {t["tarifs.subtitle"] || ""}
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {groups.map((g, i) => (
            <Reveal key={g.cat} delayMs={i * 100}>
              <div className="rounded-[18px] border border-black/[0.06] bg-white p-7">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-display text-2xl text-[var(--black)]">{g.cat}</h2>
                  <span className="rounded-full bg-black/[0.05] px-3 py-1 text-xs font-semibold text-[var(--text-2)]">
                    {g.count} {t["fleet.title"]?.toLowerCase() || "véhicules"}
                  </span>
                </div>
                {g.min !== null ? (
                  <p className="mt-4 text-[var(--text-2)]">
                    {t["tarifs.from"] || "À partir de"}{" "}
                    <span className="font-display text-3xl text-[var(--red)]">
                      {g.min.toLocaleString("fr-FR")} {t["tarifs.perDay"] || "DA / jour"}
                    </span>
                  </p>
                ) : (
                  <p className="mt-4 text-sm text-[var(--text-2)]">
                    {t["tarifs.empty"] || ""}
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center">
          <a
            href={`/${locale}/flotte`}
            className="btn-pill btn-red inline-block px-9 py-4 text-base"
          >
            {t["cta.button"] || "Voir la flotte complète"}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
