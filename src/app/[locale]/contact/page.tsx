import { headers } from "next/headers";
import { getSiteContent, isLocale, DEFAULT_LOCALE } from "@/lib/i18n";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const h = await headers();
  const raw = h.get("x-chadli-locale");
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = await getSiteContent(locale);

  return (
    <section
      className="min-h-screen px-6 pt-32 pb-24 md:px-12"
      style={{
        background:
          "linear-gradient(180deg, var(--black) 0%, var(--off) 12%, var(--off) 100%)",
      }}
    >
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-10 lg:grid-cols-2">
        <Reveal>
          <h1 className="font-display text-4xl text-white md:text-5xl">
            {t["contact.title"] || "Contactez-nous"}
          </h1>
          <p className="mt-4 text-[17px] text-white/55">
            {t["contact.subtitle"] || ""}
          </p>
          <div className="mt-10 space-y-3 text-[15px] text-white/70">
            <p>📞 {t["contact.phone"]}</p>
            <p>💬 WhatsApp : {t["contact.whatsapp"]}</p>
            <p>✉️ {t["contact.email"]}</p>
            <p>📍 {t["contact.address"]}</p>
          </div>
        </Reveal>
        <Reveal delayMs={150}>
          <div className="rounded-[28px] border border-black/[0.06] bg-white p-8">
            <h2 className="font-display text-xl text-[var(--black)]">
              {t["contact.title"] || "Contactez-nous"}
            </h2>
            <ContactForm
              labels={{
                name: t["booking.name"] || "Nom complet",
                email: "Email",
                message: "Message",
                submit: "Envoyer",
                success: "Message envoyé ! Nous vous répondrons vite.",
              }}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
