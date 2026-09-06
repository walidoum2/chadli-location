import { prisma } from "./db";

export type Locale = "fr" | "ar" | "en";
export const LOCALES: Locale[] = ["fr", "ar", "en"];
export const DEFAULT_LOCALE: Locale = "fr";

export function isLocale(v: string | undefined | null): v is Locale {
  return v === "fr" || v === "ar" || v === "en";
}

/**
 * Load all site content for a locale. Missing ar/en values fall back to French.
 * Returns a plain Record<key, string> for easy use in server components.
 */
export async function getSiteContent(locale: Locale): Promise<Record<string, string>> {
  const rows = await prisma.siteContent.findMany();
  const map: Record<string, string> = {};
  for (const row of rows) {
    const v =
      (locale === "ar" && row.valueAr) ||
      (locale === "en" && row.valueEn) ||
      row.valueFr;
    map[row.key] = v;
  }
  return map;
}

/** Car names/descriptions also fall back to French. */
export function carName(car: { nameFr: string; nameAr: string | null; nameEn: string | null }, locale: Locale): string {
  return (locale === "ar" && car.nameAr) || (locale === "en" && car.nameEn) || car.nameFr;
}

export function carDesc(car: { descFr: string | null; descAr: string | null; descEn: string | null }, locale: Locale): string {
  return (locale === "ar" && car.descAr) || (locale === "en" && car.descEn) || car.descFr || "";
}

/** Parse "Agency A|Agency B" agency list from SiteContent. */
export function agencyList(content: Record<string, string>): string[] {
  const raw = content["agencies.list"] || "Alger — Aéroport";
  return raw.split("|").map((s) => s.trim()).filter(Boolean);
}

/** Render "À votre {accent}rythme{/accent}" — wraps accent part in a span. */
export function renderAccent(text: string): { before: string; accent: string; after: string } {
  const m = text.match(/^(.*)\{accent\}([\s\S]*)\{\/accent\}([\s\S]*)$/);
  if (!m) return { before: text, accent: "", after: "" };
  return { before: m[1], accent: m[2], after: m[3] };
}
