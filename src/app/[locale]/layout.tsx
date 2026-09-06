import { isLocale, DEFAULT_LOCALE } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import FooterCta from "@/components/Footer";
import DirSync from "@/components/DirSync";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  return (
    <>
      <DirSync locale={locale} />
      <TopBar locale={locale} />
      <Navbar locale={locale} />
      <main className="min-h-screen">{children}</main>
      <FooterCta locale={locale} />
    </>
  );
}
