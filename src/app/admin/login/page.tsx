import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { ensureCsrfToken } from "@/lib/csrf";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  const token = await ensureCsrfToken();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--black)] px-6">
      <div className="glass w-full max-w-[400px] rounded-[28px] p-10">
        <div className="font-display text-center text-2xl text-white">
          CHADLI<span className="text-[var(--red)]">.</span>
        </div>
        <p className="mt-2 text-center text-sm text-white/50">
          Panneau d&apos;administration
        </p>
        <LoginForm csrfToken={token} />
      </div>
    </div>
  );
}
