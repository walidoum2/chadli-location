import type { Metadata } from "next";
import { headers } from "next/headers";
import { isLocale, DEFAULT_LOCALE } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chadli Location — Location de voitures en Algérie",
  description:
    "Réservez un véhicule en quelques secondes. Livraison rapide, tarifs transparents, sans surprise.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware sets x-chadli-locale for public routes;
  // admin routes use the admin-locale cookie instead.
  const h = await headers();
  const urlLocale = h.get("x-chadli-locale");
  const cookieLocale = h.get("cookie")?.match(/admin-locale=(ar|en|fr)/)?.[1];
  const locale = isLocale(urlLocale) ? urlLocale : isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Manrope 800 = display, Inter = body, IBM Plex Sans Arabic for ar */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={locale === "ar" ? "font-arabic" : undefined}>{children}</body>
    </html>
  );
}
