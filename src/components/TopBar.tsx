import Link from "next/link";
import { getSiteContent, type Locale } from "@/lib/i18n";

/**
 * Slim bar fixed above the main navbar: phone on the left, Admin entry on the
 * right (also duplicated in the footer so it's reachable by scrolling).
 * Page links live in the main navbar below.
 */
export default async function TopBar({ locale }: { locale: Locale }) {
  const t = await getSiteContent(locale);

  return (
    <div className="topbar">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-1.5 text-[12px]">
        <a
          href={`tel:${(t["contact.phone"] || "").replace(/\s/g, "")}`}
          className="text-white/45 transition-colors hover:text-white"
        >
          📞 {t["contact.phone"]}
        </a>
        <div className="flex items-center gap-4">
          <span className="hidden text-white/35 sm:block">{t["agences.hours"]}</span>
          <Link
            href="/admin"
            className="rounded-full border border-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white/60 transition-colors hover:border-[var(--red)] hover:text-[var(--red)]"
          >
            Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
