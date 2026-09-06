import { prisma } from "@/lib/db";
import ContentEditor from "./ContentEditor";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const rows = await prisma.siteContent.findMany({ orderBy: { key: "asc" } });

  const initial: Record<string, { fr: string; ar: string; en: string }> = {};
  for (const r of rows) {
    initial[r.key] = { fr: r.valueFr, ar: r.valueAr || "", en: r.valueEn || "" };
  }

  return (
    <div>
      <h1 className="font-display text-2xl">Contenu du site</h1>
      <p className="mt-1 text-sm text-[var(--text-2)]">
        Modifiez les textes du site public. Chaque champ existe en 3 langues —
        laissez l&apos;arabe ou l&apos;anglais vide pour retomber sur le français.
      </p>
      <ContentEditor initial={initial} />
    </div>
  );
}
