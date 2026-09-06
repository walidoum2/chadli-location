/**
 * In-memory rate limiter. Fine for single-node deployment.
 * For multi-instance production, swap the Map for Redis/Upstash —
 * call sites only depend on hit() returning { allowed, retryAfterSec }.
 */

interface Bucket {
  count: number;
  windowStart: number;
  blockedUntil?: number;
}

const buckets = new Map<string, Bucket>();

// Periodic sweep so the map doesn't grow forever.
let lastSweep = Date.now();
function sweep() {
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, b] of buckets) {
    if (b.blockedUntil && b.blockedUntil < now) buckets.delete(k);
    else if (!b.blockedUntil && now - b.windowStart > 30 * 60_000) buckets.delete(k);
  }
}

export interface RateResult {
  allowed: boolean;
  retryAfterSec: number;
}

/**
 * Sliding-window-ish counter with optional lockout.
 * @param key unique key, e.g. "login:1.2.3.4"
 * @param max max hits inside windowMs
 * @param windowMs reset window
 * @param lockoutMs if exceeded, block for this long
 */
export function hit(
  key: string,
  max: number,
  windowMs: number,
  lockoutMs: number
): RateResult {
  sweep();
  const now = Date.now();
  const b = buckets.get(key);

  if (b?.blockedUntil && b.blockedUntil > now) {
    return { allowed: false, retryAfterSec: Math.ceil((b.blockedUntil - now) / 1000) };
  }

  if (!b || now - b.windowStart > windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, retryAfterSec: 0 };
  }

  b.count += 1;
  if (b.count > max) {
    b.blockedUntil = now + lockoutMs;
    return { allowed: false, retryAfterSec: Math.ceil(lockoutMs / 1000) };
  }
  return { allowed: true, retryAfterSec: 0 };
}

/** Best-effort client IP from proxy headers, fallback loopback. */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}
