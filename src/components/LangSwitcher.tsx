"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

const LOCALES: Array<{ code: Locale; label: string }> = [
  { code: "fr", label: "FR" },
  { code: "ar", label: "AR" },
  { code: "en", label: "EN" },
];

export default function LangSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  // Swap the locale segment in the current path.
  const hrefFor = (code: Locale) => {
    const parts = (pathname || "/").split("/");
    if (parts.length > 1 && ["fr", "ar", "en"].includes(parts[1])) {
      parts[1] = code;
    } else {
      parts.splice(1, 0, code);
    }
    return parts.join("/") || `/${code}`;
  };

  return (
    <div className="flex items-center gap-1 text-xs font-semibold">
      {LOCALES.map((l) => (
        <Link
          key={l.code}
          href={hrefFor(l.code)}
          className={
            l.code === locale
              ? "px-2 py-1 rounded-full bg-[var(--red)] text-white"
              : "px-2 py-1 rounded-full text-white/60 hover:text-white"
          }
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}
