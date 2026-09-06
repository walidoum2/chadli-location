"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";

const NAV = [
  { href: "/admin", fr: "Tableau de bord", ar: "لوحة التحكم", en: "Dashboard", icon: "▦" },
  { href: "/admin/cars", fr: "Flotte", ar: "الأسطول", en: "Fleet", icon: "🚗" },
  { href: "/admin/reservations", fr: "Réservations", ar: "الحجوزات", en: "Reservations", icon: "📅" },
  { href: "/admin/content", fr: "Contenu", ar: "المحتوى", en: "Content", icon: "✏️" },
  { href: "/admin/messages", fr: "Messages", ar: "الرسائل", en: "Messages", icon: "✉️" },
  { href: "/admin/settings", fr: "Paramètres", ar: "الإعدادات", en: "Settings", icon: "⚙️" },
];

const T = {
  logout: { fr: "Déconnexion", ar: "تسجيل الخروج", en: "Sign out" },
  lang: { fr: "Langue", ar: "اللغة", en: "Language" },
};

export default function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("fr");
  const dir = locale === "ar" ? "rtl" : "ltr";

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div dir={dir} className="min-h-screen bg-[#f5f5f7] text-[var(--black)]">
      <div className="flex min-h-screen">
        <aside
          className={`flex w-60 shrink-0 flex-col border-black/[0.06] bg-white max-md:hidden ${dir === "rtl" ? "border-l" : "border-r"}`}
        >
          <div className="px-6 py-6 font-display text-xl">
            CHADLI<span className="text-[var(--red)]">.</span>
            <span className="ml-2 text-xs font-medium text-[var(--gray)]">admin</span>
          </div>
          <nav className="flex-1 space-y-1 px-3">
            {NAV.map((n) => {
              const active =
                n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[rgba(224,30,38,0.08)] text-[var(--red)]"
                      : "text-[var(--text-2)] hover:bg-black/[0.04] hover:text-black"
                  }`}
                >
                  <span>{n.icon}</span>
                  {n[locale]}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-black/[0.06] p-4">
            <p className="truncate text-xs text-[var(--gray)]">{email}</p>
            <button
              onClick={logout}
              className="mt-2 text-sm font-semibold text-[var(--red)] hover:underline"
            >
              {T.logout[locale]}
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <header className="flex items-center justify-between border-b border-black/[0.06] bg-white px-6 py-4">
            <div className="md:hidden font-display">CHADLI.</div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-[var(--gray)]">{T.lang[locale]}</span>
              {(["fr", "ar", "en"] as Locale[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className={
                    l === locale
                      ? "rounded-full bg-[var(--red)] px-2.5 py-1 text-white"
                      : "rounded-full px-2.5 py-1 text-[var(--text-2)] hover:text-black"
                  }
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </header>
          <main className="p-6 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
