"use client";

import { useEffect } from "react";

/**
 * The root layout renders once on the server; on client-side locale switches
 * (FR → AR via the navbar switcher) it does NOT re-render, so <html dir/lang>
 * would keep the previous locale's values. This component syncs them after
 * every navigation so RTL layout applies immediately without a reload.
 */
export default function DirSync({ locale }: { locale: string }) {
  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    const root = document.documentElement;
    root.setAttribute("dir", dir);
    root.setAttribute("lang", locale);
    document.body.classList.toggle("font-arabic", locale === "ar");
  }, [locale]);

  return null;
}
