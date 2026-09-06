import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

/**
 * Auth guard for every /admin/* page except /admin/login.
 * (Middleware checks the cookie first as a fast path; this re-verifies
 * the signature + that the admin still exists in the DB.)
 */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return <AdminShell email={session.email}>{children}</AdminShell>;
}
