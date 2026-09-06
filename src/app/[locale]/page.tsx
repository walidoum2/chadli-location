import Link from "next/link";
import { headers } from "next/headers";
import {
  getSiteContent,
  agencyList,
  isLocale,
  DEFAULT_LOCALE,
  renderAccent,
} from "@/lib/i18n";
import { availableCars } from "@/lib/availability";
import { prisma } from "@/lib/db";
import SearchBar from "@/components/SearchBar";
import CarCard from "@/components/CarCard";
import Reveal from "@/components/Reveal";
import BrandMarquee from "@/components/BrandMarquee";

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M5 13l4 4L19 7" /></svg>
  ),
  truck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect x="1" y="3" width="15" height="13" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z" /></svg>
  ),
};

export default async function HomePage() {
  const h = await headers();
  const raw = h.get("x-chadli-locale");
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = await getSiteContent(locale);
  const cars = await availableCars();

  const line2raw = t["hero.title.line2"] || "À votre {accent}rythme{/accent}.";
  const line2 = renderAccent(line2raw);

  return (
    <>
      {/* ===== HERO ===== */}
      <section
        className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-32 pb-20 text-center"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(224,30,38,0.18), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(224,30,38,0.08), transparent), linear-gradient(180deg, var(--black) 0%, var(--graphite) 100%)",
        }}
      >
        <div className="anim-init anim-play text-[15px] font-medium text-[var(--gray)]" style={{ animationDelay: "0.1s" }}>
          {t["hero.eyebrow"] || "Location de voitures premium en Algérie"}
        </div>
        <h1 className="font-display mt-4 max-w-[920px] text-5xl leading-[1.02] text-white md:text-7xl lg:text-[84px]">
          <span className="hero-line block overflow-hidden">
            <span>{t["hero.title.line1"] || "Prenez la route."}</span>
          </span>
          <span className="hero-line block overflow-hidden">
            <span>
              {line2.before}
              {line2.accent && <span className="text-[var(--red)]">{line2.accent}</span>}
              {line2.after}
            </span>
          </span>
        </h1>
        <p
          className="anim-init anim-play mx-auto mt-6 max-w-[560px] text-[19px] leading-relaxed text-white/60"
          style={{ animationDelay: "0.5s" }}
        >
          {t["hero.subtext"] || "Réservez un véhicule en quelques secondes."}
        </p>
        <div
          className="anim-init anim-play mt-12 w-full"
          style={{ animationDelay: "0.75s" }}
        >
          <SearchBar
            defaults={{
              locations: agencyList(t),
              labels: {
                place: t["search.pickup.label"] || "Lieu de retrait",
                depart: t["search.depart.label"] || "Départ",
                retour: t["search.retour.label"] || "Retour",
              },
              locale,
            }}
          />
        </div>

        {/* Moving brand bar — editable via admin key "marquee.brands" */}
        <div className="mt-14 w-full">
          <BrandMarquee locale={locale} />
        </div>
      </section>

      {/* ===== FLEET ===== */}
      <section
        className="px-6 pt-24 pb-24 md:px-12"
        style={{
          background:
            "linear-gradient(180deg, var(--graphite) 0%, var(--off) 8%, var(--off) 100%)",
        }}
      >
        <Reveal className="mx-auto mb-16 max-w-[600px] text-center">
          <h2 className="font-display text-4xl text-[var(--black)] md:text-[46px]">
            {t["fleet.title"] || "Véhicules disponibles"}
          </h2>
          <p className="mt-4 text-[17px] text-[var(--text-2)]">
            {t["fleet.subtitle"] || "Sélectionnés pour le confort."}
          </p>
        </Reveal>
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-7 md:grid-cols-3">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} locale={locale} t={t} />
          ))}
          {cars.length === 0 && (
            <p className="col-span-full text-center text-[var(--text-2)]">
              Aucun véhicule disponible pour le moment.
            </p>
          )}
        </div>
        <div className="mt-10 text-center">
          <Link
            href={`/${locale}/flotte`}
            className="text-sm font-semibold text-[var(--red)] hover:underline"
          >
            Voir toute la flotte →
          </Link>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="bg-[var(--off)] px-6 pb-32 md:px-12">
        <Reveal className="mx-auto mb-14 max-w-[600px] text-center">
          <h2 className="font-display text-4xl text-[var(--black)] md:text-[46px]">
            {t["features.title"] || "Pourquoi nous choisir"}
          </h2>
        </Reveal>
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((n) => {
            const icon = t[`feature.${n}.icon`] || "check";
            return (
              <Reveal key={n} delayMs={n * 120}>
                <div className="rounded-[18px] border border-black/[0.06] bg-white p-9">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(224,30,38,0.1)] text-[var(--red)]">
                    {FEATURE_ICONS[icon] || FEATURE_ICONS.check}
                  </div>
                  <h3 className="mb-2 text-lg font-bold tracking-tight text-[var(--black)]">
                    {t[`feature.${n}.title`] || ""}
                  </h3>
                  <p className="text-[14.5px] leading-relaxed text-[var(--text-2)]">
                    {t[`feature.${n}.desc`] || ""}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ===== FAQ (on the homepage) ===== */}
      <section className="bg-[var(--off)] px-6 pb-28 md:px-12">
        <Reveal className="mx-auto mb-12 max-w-[600px] text-center">
          <h2 className="font-display text-4xl text-[var(--black)] md:text-[46px]">
            {t["faq.title"] || "Questions fréquentes"}
          </h2>
          <p className="mt-4 text-[17px] text-[var(--text-2)]">
            {t["faq.subtitle"] || ""}
          </p>
        </Reveal>
        <div className="mx-auto max-w-[760px] space-y-3">
          {[1, 2, 3, 4, 5, 6]
            .map((n) => ({ q: t[`faq.q${n}`], a: t[`faq.a${n}`] }))
            .filter((x) => x.q && x.a)
            .map((item, i) => (
              <Reveal key={i} delayMs={i * 60}>
                <details className="group rounded-[18px] border border-black/[0.06] bg-white px-6 py-5 open:shadow-lg">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[var(--black)]">
                    {item.q}
                    <span className="shrink-0 text-xl text-[var(--red)] transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 border-t border-black/[0.06] pt-3 text-[14.5px] leading-relaxed text-[var(--text-2)]">
                    {item.a}
                  </p>
                </details>
              </Reveal>
            ))}
        </div>
        <Reveal className="mt-10 text-center">
          <Link
            href={`/${locale}/faq`}
            className="text-sm font-semibold text-[var(--red)] hover:underline"
          >
            {t["footer.faq"] || "FAQ"} →
          </Link>
        </Reveal>
      </section>
    </>
  );
}
