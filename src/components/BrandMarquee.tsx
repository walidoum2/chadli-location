import { getSiteContent } from "@/lib/i18n";

/**
 * Infinite moving brand bar (marquee). Content comes from the DB key
 * "marquee.brands" (| separated) so the admin can edit it in the
 * Content Editor — no code change needed.
 * Pure CSS animation; pauses on hover; duplicated track for a seamless loop.
 */
export default async function BrandMarquee({ locale }: { locale: string }) {
  const t = await getSiteContent(locale as "fr" | "ar" | "en");
  const raw = t["marquee.brands"] || "";
  const brands = raw.split("|").map((s) => s.trim()).filter(Boolean);
  if (brands.length === 0) return null;

  const label = t["marquee.label"] || "";

  return (
    <div className="marquee-zone w-full" dir="ltr">
      {label && (
        <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
          {label}
        </p>
      )}
      <div className="marquee">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="marquee-group" aria-hidden={copy === 1}>
              {brands.map((b) => (
                <span key={`${copy}-${b}`} className="marquee-item font-display">
                  {b}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
