import { prisma } from "@/lib/db";
import MessagesList from "./MessagesList";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const rows = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-display text-2xl">Messages</h1>
      <div className="mt-6">
        {rows.length === 0 ? (
          <div className="admin-card p-6 text-sm text-[var(--text-2)]">
            Aucun message pour le moment.
          </div>
        ) : (
          <MessagesList
            rows={rows.map((m) => ({
              id: m.id,
              name: m.name,
              email: m.email,
              message: m.message,
              read: m.read,
              createdAt: m.createdAt.toISOString(),
            }))}
          />
        )}
      </div>
    </div>
  );
}
