"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BookingForm({
  carId,
  locale,
  locations,
  labels,
}: {
  carId: string;
  locale: string;
  locations: string[];
  labels: Record<string, string>;
}) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const searchParams = useSearchParams();
  const now = new Date();
  // Prefill from the fleet-search query params when present.
  const qDepart = searchParams.get("depart");
  const qRetour = searchParams.get("retour");
  const [pickup, setPickup] = useState(
    qDepart && !isNaN(new Date(qDepart).getTime())
      ? toLocalInput(new Date(qDepart))
      : toLocalInput(new Date(now.getTime() + 86400000))
  );
  const [retour, setRetour] = useState(
    qRetour && !isNaN(new Date(qRetour).getTime())
      ? toLocalInput(new Date(qRetour))
      : toLocalInput(new Date(now.getTime() + 3 * 86400000))
  );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrMsg("");
    const fd = new FormData(e.currentTarget);
    if (new Date(String(fd.get("returnAt"))) <= new Date(String(fd.get("pickupAt")))) {
      setErrMsg("Le retour doit être après le départ.");
      return;
    }
    setState("sending");
    const res = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        carId,
        customerName: fd.get("customerName"),
        phone: fd.get("phone"),
        email: fd.get("email"),
        pickupAt: new Date(String(fd.get("pickupAt"))).toISOString(),
        returnAt: new Date(String(fd.get("returnAt"))).toISOString(),
        pickupLocation: fd.get("pickupLocation"),
        website: fd.get("website"),
      }),
    });
    if (res.ok) {
      setState("done");
    } else {
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
      <div className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-700">
        {labels.success}
      </div>
    );
  }

  const inputCls =
    "mt-1 w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-black outline-none focus:border-[var(--red)]";
  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-[var(--text-2)]";

  return (
    <form onSubmit={submit} className="mt-4 space-y-3.5">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div>
        <label className={labelCls}>{labels.name}</label>
        <input name="customerName" required minLength={2} maxLength={120} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>{labels.phone}</label>
        <input name="phone" required className={inputCls} placeholder="+213 ..." />
      </div>
      <div>
        <label className={labelCls}>{labels.email}</label>
        <input name="email" type="email" className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{labels.depart}</label>
          <input name="pickupAt" type="datetime-local" required value={pickup} onChange={(e) => setPickup(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>{labels.retour}</label>
          <input name="returnAt" type="datetime-local" required value={retour} onChange={(e) => setRetour(e.target.value)} className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>{labels.place}</label>
        <select name="pickupLocation" required className={inputCls}>
          {locations.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>
      {errMsg && <p className="text-sm text-[var(--red)]">{errMsg}</p>}
      <button
        type="submit"
        disabled={state === "sending"}
        className="btn-pill btn-red w-full py-3 text-sm disabled:opacity-60"
      >
        {state === "sending" ? "..." : labels.submit}
      </button>
    </form>
  );
}
