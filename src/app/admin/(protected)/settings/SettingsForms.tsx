"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsForms({ initialLogo }: { initialLogo: string }) {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState(initialLogo);
  const [logoMsg, setLogoMsg] = useState("");
  const [savingLogo, setSavingLogo] = useState(false);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  async function saveLogo(e: React.FormEvent) {
    e.preventDefault();
    setSavingLogo(true);
    setLogoMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "logo", logoUrl }),
    });
    const j = await res.json().catch(() => ({}));
    setLogoMsg(res.ok ? "Logo enregistré ✓" : j.error || "Erreur.");
    setSavingLogo(false);
    if (res.ok) router.refresh();
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg("");
    setPwErr(false);
    if (next.length < 10 || !/[A-Z]/.test(next) || !/[a-z]/.test(next) || !/[0-9]/.test(next)) {
      setPwMsg("Le nouveau mot de passe doit contenir au moins 10 caractères, une majuscule, une minuscule et un chiffre.");
      setPwErr(true);
      return;
    }
    setSavingPw(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "password", currentPassword: current, newPassword: next }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok) {
      // Session revoked — bounce to login
      router.replace("/admin/login");
      router.refresh();
    } else {
      setPwMsg(j.error || "Erreur.");
      setPwErr(true);
      setSavingPw(false);
    }
  }

  const inputCls =
    "mt-1 w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--red)]";
  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-[var(--text-2)]";

  return (
    <div className="mt-6 grid max-w-[900px] grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Password */}
      <form onSubmit={changePassword} className="admin-card p-6">
        <h2 className="font-display text-lg">Changer le mot de passe</h2>
        <p className="mt-1 text-xs text-[var(--gray)]">
          Après le changement, vous serez déconnecté et devrez vous reconnecter.
        </p>
        <div className="mt-4">
          <label className={labelCls}>Mot de passe actuel</label>
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            autoComplete="current-password"
            className={inputCls}
          />
        </div>
        <div className="mt-3">
          <label className={labelCls}>Nouveau mot de passe</label>
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            autoComplete="new-password"
            className={inputCls}
          />
          <p className="mt-1 text-xs text-[var(--gray)]">
            Min. 10 caractères, une majuscule, une minuscule, un chiffre.
          </p>
        </div>
        {pwMsg && (
          <p className={`mt-3 text-sm ${pwErr ? "text-[var(--red)]" : "text-green-700"}`}>{pwMsg}</p>
        )}
        <button
          type="submit"
          disabled={savingPw}
          className="btn-pill btn-red mt-5 px-6 py-2.5 text-sm disabled:opacity-60"
        >
          {savingPw ? "..." : "Changer le mot de passe"}
        </button>
      </form>

      {/* Logo */}
      <form onSubmit={saveLogo} className="admin-card p-6">
        <h2 className="font-display text-lg">Logo du site</h2>
        <p className="mt-1 text-xs text-[var(--gray)]">
          Laissez vide pour le logo texte « CHADLI. » par défaut. Accepte une URL https
          ou un fichier envoyé via la bibliothèque (chemin /uploads/...).
        </p>
        {logoUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={logoUrl}
            alt="Logo actuel"
            className="mt-4 h-16 rounded-xl border border-black/[0.06] bg-white object-contain p-2"
          />
        )}
        <div className="mt-4">
          <label className={labelCls}>URL du logo</label>
          <input
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://... ou /uploads/..."
            className={inputCls}
          />
        </div>
        {logoMsg && <p className="mt-3 text-sm text-[var(--red)]">{logoMsg}</p>}
        <button
          type="submit"
          disabled={savingLogo}
          className="btn-pill btn-red mt-5 px-6 py-2.5 text-sm disabled:opacity-60"
        >
          {savingLogo ? "..." : "Enregistrer le logo"}
        </button>
      </form>
    </div>
  );
}
