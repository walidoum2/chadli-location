import Link from "next/link";
import { getSiteContent, type Locale } from "@/lib/i18n";
import LangSwitcher from "./LangSwitcher";

export default async function Navbar({ locale }: { locale: Locale }) {
  const t = await getSiteContent(locale);

  const links = [
    { href: `/${locale}/flotte`, label: t["nav.fleet"] || "Flotte" },
    { href: `/${locale}/tarifs`, label: t["nav.rates"] || "Tarifs" },
    { href: `/${locale}/agences`, label: t["nav.agencies"] || "Agences" },
    { href: `/${locale}/faq`, label: t["footer.faq"] || "FAQ" },
    { href: `/${locale}/contact`, label: t["nav.contact"] || "Contact" },
  ];

  return (
    <nav className="glass-nav fixed top-[30px] left-0 right-0 z-50 px-4 py-3 md:px-12 max-sm:top-[26px]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-y-2">
        <Link href={`/${locale}`} className="font-display text-xl text-white">
          CHADLI<span className="text-[var(--red)]">.</span>
        </Link>

        <div className="flex items-center gap-3 md:order-3 md:gap-4">
          <LangSwitcher locale={locale} />
          <Link
            href={`/${locale}/flotte`}
            className="btn-pill btn-red px-4 py-2 text-[13px] md:px-5 md:py-2.5 md:text-sm"
          >
            {t["nav.book"] || "Réserver"}
          </Link>
        </div>

        {/* Page links — row 2 on mobile (centered), inline on desktop */}
        <ul className="order-last flex basis-full list-none flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[13px] md:order-2 md:mx-auto md:basis-auto md:gap-x-8 md:text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-white/75 transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
