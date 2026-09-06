import { headers } from "next/headers";
import { getSiteContent, isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const h = await headers();
  const raw = h.get("x-chadli-locale");
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = await getSiteContent(locale);

  const items = [1, 2, 3, 4, 5, 6]
    .map((n) => ({ q: t[`faq.q${n}`], a: t[`faq.a${n}`] }))
    .filter((x) => x.q && x.a);

  return (
    <section
      className="min-h-screen px-6 pt-32 pb-24 md:px-12"
      style={{
        background:
          "linear-gradient(180deg, var(--black) 0%, var(--off) 10%, var(--off) 100%)",
      }}
    >
      <div className="mx-auto max-w-[760px]">
        <Reveal className="text-center">
          <h1 className="font-display text-4xl text-white md:text-5xl">
            {t["faq.title"] || "Questions fréquentes"}
          </h1>
          <p className="mx-auto mt-4 max-w-[560px] text-[17px] text-white/55">
            {t["faq.subtitle"] || ""}
          </p>
        </Reveal>

        <div className="mt-14 space-y-3">
          {items.map((item, i) => (
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

        <Reveal className="mt-12 text-center">
          <p className="text-[var(--text-2)]">{t["contact.subtitle"] || ""}</p>
          <a
            href={`/${locale}/contact`}
            className="btn-pill btn-red mt-5 inline-block px-8 py-3.5 text-sm"
          >
            {t["nav.contact"] || "Contact"}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
