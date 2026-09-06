"use client";

import { useEffect, useRef } from "react";

/**
 * Adds .reveal-in once when the element scrolls into view (one-time).
 * Attach to any element that has the .reveal class.
 */
export default function Reveal({
  children,
  className = "",
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.style.animationDelay = `${delayMs}ms`;
            el.classList.add("reveal-in");
            io.unobserve(el);
          }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delayMs]);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
