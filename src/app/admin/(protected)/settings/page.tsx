import { prisma } from "@/lib/db";
import SettingsForms from "./SettingsForms";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const logo = await prisma.siteContent.findUnique({ where: { key: "site.logo" } });

  return (
    <div>
      <h1 className="font-display text-2xl">Paramètres</h1>
      <SettingsForms initialLogo={logo?.valueFr || ""} />
    </div>
  );
}
