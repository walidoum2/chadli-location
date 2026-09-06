"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({ csrfToken }: { csrfToken: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({
        email: fd.get("email"),
        password: fd.get("password"),
        website: fd.get("website"),
      }),
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
    });
    if (res.ok) {
      router.replace("/admin");
      router.refresh();
    } else {
      let msg = "Échec de connexion.";
      try {
        const j = await res.json();
        if (j.error) msg = j.error;
      } catch { /* keep default */ }
      setError(msg);
      setLoading(false);
    }
  }

  const inputCls =
    "mt-1 w-full rounded-xl border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[var(--red)]";

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-white/50">Email</label>
        <input name="email" type="email" required autoComplete="username" className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-white/50">Mot de passe</label>
        <input name="password" type="password" required autoComplete="current-password" className={inputCls} />
      </div>
      {error && <p className="text-sm text-[var(--red)]">{error}</p>}
      <button type="submit" disabled={loading} className="btn-pill btn-red w-full py-3 text-sm disabled:opacity-60">
        {loading ? "..." : "Se connecter"}
      </button>
    </form>
  );
}
