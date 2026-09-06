import { headers } from "next/headers";
import {
  getSiteContent,
  isLocale,
  DEFAULT_LOCALE,
  agencyList,
  type Locale,
} from "@/lib/i18n";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export default async function AgencesPage() {
  const h = await headers();
  const raw = h.get("x-chadli-locale");
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = await getSiteContent(locale);

  const agencies = agencyList(t);
  const phone = t["contact.phone"] || "";
  const whatsapp = t["contact.whatsapp"] || "";
  const email = t["contact.email"] || "";
  const address = t["contact.address"] || "";
  const hours = t["agences.hours"] || "";

  return (
    <section
      className="min-h-screen px-6 pt-32 pb-24 md:px-12"
      style={{
        background:
          "linear-gradient(180deg, var(--black) 0%, var(--off) 10%, var(--off) 100%)",
      }}
    >
      <div className="mx-auto max-w-[1000px]">
        <Reveal className="text-center">
          <h1 className="font-display text-4xl text-white md:text-5xl">
            {t["agences.title"] || "Nos agences"}
          </h1>
          <p className="mx-auto mt-4 max-w-[560px] text-[17px] text-white/55">
            {t["agences.subtitle"] || ""}
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {agencies.map((a, i) => (
            <Reveal key={a} delayMs={i * 80}>
              <div className="rounded-[18px] border border-black/[0.06] bg-white p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(224,30,38,0.1)] text-xl text-[var(--red)]">
                    📍
                  </div>
                  <div>
                    <h2 className="font-display text-lg text-[var(--black)]">{a}</h2>
                    <p className="mt-1.5 text-sm text-[var(--text-2)]">
                      <span className="font-semibold">{t["agences.hoursLabel"] || "Horaires"} :</span>{" "}
                      {hours}
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-2)]">📞 {phone}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Contact block */}
        <Reveal className="mt-12">
          <div
            className="rounded-[28px] p-10 text-center"
            style={{
              background:
                "radial-gradient(ellipse 60% 120% at 50% 100%, rgba(224,30,38,0.16), transparent), linear-gradient(180deg, var(--graphite) 0%, var(--black) 100%)",
            }}
          >
            <h2 className="font-display text-2xl text-white md:text-3xl">
              {t["contact.title"] || "Contactez-nous"}
            </h2>
            <div className="mx-auto mt-6 grid max-w-[640px] grid-cols-1 gap-3 text-left text-sm text-white/70 sm:grid-cols-2">
              <p>📞 {phone}</p>
              <p>💬 WhatsApp : {whatsapp}</p>
              <p>✉️ {email}</p>
              <p>📍 {address}</p>
            </div>
            <a
              href={`/${locale}/contact`}
              className="btn-pill btn-red mt-8 inline-block px-8 py-3.5 text-sm"
            >
              {t["nav.contact"] || "Contact"}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
