import Link from "next/link";
import { getSiteContent, agencyList, type Locale } from "@/lib/i18n";
import Reveal from "./Reveal";

export default async function FooterCta({ locale }: { locale: Locale }) {
  const t = await getSiteContent(locale);

  const explore = [
    { href: `/${locale}/flotte`, label: t["nav.fleet"] || "Flotte" },
    { href: `/${locale}/tarifs`, label: t["nav.rates"] || "Tarifs" },
    { href: `/${locale}/agences`, label: t["nav.agencies"] || "Agences" },
    { href: `/${locale}/faq`, label: t["footer.faq"] || "FAQ" },
    { href: `/${locale}/contact`, label: t["nav.contact"] || "Contact" },
  ];

  return (
    <>
      {/* ===== CTA section ===== */}
      <section className="relative overflow-hidden bg-[var(--black)] px-6 py-28 text-center">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(224,30,38,0.22), transparent)",
          }}
        />
        <Reveal className="relative">
          <h2 className="font-display mb-6 text-4xl text-white md:text-5xl">
            {t["cta.title"] || "Prêt à prendre le volant ?"}
          </h2>
          <Link href={`/${locale}/flotte`} className="btn-pill btn-red relative inline-block px-9 py-4 text-base">
            {t["cta.button"] || "Voir la flotte complète"}
          </Link>
        </Reveal>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-white/[0.06] bg-[var(--black)]">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-6 py-14 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="font-display text-xl text-white">
              CHADLI<span className="text-[var(--red)]">.</span>
            </div>
            <p className="mt-4 max-w-[280px] text-sm leading-relaxed text-white/45">
              {t["footer.about"] || ""}
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">
              {t["nav.fleet"] && t["nav.contact"] ? (
                <>
                  {t["nav.fleet"]} · {t["nav.contact"]}
                </>
              ) : (
                "Navigation"
              )}
            </h3>
            <ul className="mt-4 list-none space-y-2.5">
              {explore.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/60 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">Contact</h3>
            <ul className="mt-4 list-none space-y-2.5 text-sm text-white/60">
              <li>📞 {t["contact.phone"]}</li>
              <li>💬 {t["contact.whatsapp"]}</li>
              <li>
                ✉️{" "}
                <a href={`mailto:${t["contact.email"]}`} className="hover:text-white">
                  {t["contact.email"]}
                </a>
              </li>
              <li>📍 {t["contact.address"]}</li>
            </ul>
          </div>

          {/* Agencies */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">
              {t["nav.agencies"] || "Agences"}
            </h3>
            <ul className="mt-4 list-none space-y-2.5 text-sm text-white/60">
              {agencyList(t).map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-white/[0.06] px-6 py-6 text-center text-sm text-white/35 sm:flex-row">
          <span>
            © {new Date().getFullYear()} Chadli Location — {t["footer.rights"] || "Tous droits réservés."}
          </span>
          <Link
            href="/admin"
            className="text-white/30 transition-colors hover:text-[var(--red)]"
          >
            Admin
          </Link>
        </div>
      </footer>
    </>
  );
}
