"use client";

import { useState } from "react";

export default function ContactForm({
  labels,
}: {
  labels: Record<string, string>;
}) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrMsg("");
    const fd = new FormData(e.currentTarget);
    setState("sending");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        message: fd.get("message"),
        website: fd.get("website"),
      }),
    });
    if (res.ok) setState("done");
    else {
      let msg = "Une erreur est survenue.";
      try {
        const j = await res.json();
        if (j.error) msg = j.error;
      } catch { /* keep default */ }
      setErrMsg(msg);
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-700">
        {labels.success}
      </div>
    );
  }

  const inputCls =
    "mt-1 w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-black outline-none focus:border-[var(--red)]";

  return (
    <form onSubmit={submit} className="mt-4 space-y-3.5">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-2)]">{labels.name}</label>
        <input name="name" required minLength={2} maxLength={120} className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-2)]">{labels.email}</label>
        <input name="email" type="email" required className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-2)]">{labels.message}</label>
        <textarea name="message" required minLength={10} maxLength={2000} rows={5} className={inputCls} />
      </div>
      {errMsg && <p className="text-sm text-[var(--red)]">{errMsg}</p>}
      <button type="submit" disabled={state === "sending"} className="btn-pill btn-red w-full py-3 text-sm disabled:opacity-60">
        {state === "sending" ? "..." : labels.submit}
      </button>
    </form>
  );
}
