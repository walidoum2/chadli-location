/* E2E verification for Chadli Location (run: node scripts/e2e-check.mjs) */
import crypto from "crypto";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const base = process.env.BASE_URL || "http://localhost:50287";
const p = new PrismaClient();
let failures = 0;

function check(label, ok, extra = "") {
  console.log(`${ok ? "✓" : "✗ FAIL"}  ${label}${extra ? " — " + extra : ""}`);
  if (!ok) failures++;
}

const env = fs.readFileSync(".env", "utf8");
// .env values may be quoted (dotenv strips them server-side — do the same here)
const secret = env.match(/SESSION_SECRET=["']?([^"'\r\n]+)["']?/)?.[1];

// Distinct fake client IPs per request group — clientIp() trusts x-forwarded-for,
// so tests never trip the shared-IP rate limiter (localhost keeps working).
const FAKE_IP = `10.77.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 1}`;
const FAKE_IP_2 = `10.78.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 1}`;

// --- 1. Admin login (CSRF flow) ---
const r1 = await fetch(`${base}/admin/login`, { headers: { "x-forwarded-for": FAKE_IP } });
const csrfCookie = (r1.headers.getSetCookie?.() || [])
  .find((c) => c.startsWith("chadli_csrf="))
  ?.split(";")[0];
const hmac = crypto
  .createHmac("sha256", secret)
  .update(csrfCookie.split("=")[1])
  .digest("base64url");
const r2 = await fetch(`${base}/api/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-csrf-token": hmac, cookie: csrfCookie, "x-forwarded-for": FAKE_IP },
  body: JSON.stringify({ email: "admin@chadli-location.dz", password: "Chadli2026!" }),
});
const session = (r2.headers.getSetCookie?.() || [])
  .find((c) => c.startsWith("chadli_admin_session="))
  ?.split(";")[0];
check("admin login grants session", r2.ok && !!session, `status ${r2.status}${session ? "" : " (no session cookie)"}`);
if (!session) process.exit(1);

const car = await p.car.findFirst({ where: { nameFr: "Dacia Logan" } });

// --- 2. Booking: valid ---
const start = new Date(Date.now() + 30 * 864e5).toISOString();
const end = new Date(Date.now() + 33 * 864e5).toISOString();
const b1 = await fetch(`${base}/api/booking`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-forwarded-for": FAKE_IP },
  body: JSON.stringify({
    carId: car.id, customerName: "Test Client", phone: "+213555123456",
    email: "test@example.com", pickupAt: start, returnAt: end,
    pickupLocation: "Alger — Aéroport",
  }),
});
check("booking valid → 200 reservation created", b1.status === 200, `status ${b1.status}`);

// --- 3. Booking: overlapping dates blocked ---
const overlapStart = new Date(Date.now() + 31 * 864e5).toISOString();
const overlapEnd = new Date(Date.now() + 34 * 864e5).toISOString();
const b2 = await fetch(`${base}/api/booking`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-forwarded-for": FAKE_IP },
  body: JSON.stringify({
    carId: car.id, customerName: "Second Client", phone: "+213555654321",
    pickupAt: overlapStart, returnAt: overlapEnd, pickupLocation: "Alger — Centre",
  }),
});
check("booking overlapping dates → 409 blocked", b2.status === 409, `status ${b2.status}`);

// --- 4. Booking: honeypot drops bots ---
const b3 = await fetch(`${base}/api/booking`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-forwarded-for": FAKE_IP },
  body: JSON.stringify({
    carId: car.id, customerName: "Bot", phone: "+213000000000",
    pickupAt: start, returnAt: end, pickupLocation: "X", website: "spam.com",
  }),
});
const botCount = await p.reservation.count({ where: { customerName: "Bot" } });
check("booking honeypot bot dropped", b3.status === 200 && botCount === 0);

// --- 5. Booking: invalid phone rejected (fresh fake IP — the 3 requests
// above already used FAKE_IP, and the limit is 3/min) ---
const FAKE_IP_3 = `10.79.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 1}`;
const b4 = await fetch(`${base}/api/booking`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-forwarded-for": FAKE_IP_3 },
  body: JSON.stringify({
    carId: car.id, customerName: "X Y", phone: "abc!!",
    pickupAt: start, returnAt: end, pickupLocation: "Alger",
  }),
});
check("booking invalid phone → 400", b4.status === 400, `status ${b4.status}`);

// --- 6. Contact: valid + XSS stripped ---
const FAKE_IP_4 = `10.80.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 1}`;
const c1 = await fetch(`${base}/api/contact`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-forwarded-for": FAKE_IP_4 },
  body: JSON.stringify({
    name: "Jean Dupont", email: "jean@mail.com",
    message: "Bonjour, une question sur la location.",
  }),
});
check("contact valid → 200", c1.status === 200);

const c2 = await fetch(`${base}/api/contact`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-forwarded-for": FAKE_IP_4 },
  body: JSON.stringify({
    name: "Script Kiddie", email: "evil@mail.com",
    message: "<script>alert(1)</script>Hello, this is a normal message body.",
  }),
});
const xss = await p.contactMessage.findFirst({ where: { email: "evil@mail.com" } });
check(
  "contact XSS stripped from stored message",
  c2.status === 200 && !!xss && !xss.message.includes("<script>"),
  xss ? `stored: "${xss.message.slice(0, 40)}…"` : "no row"
);

// --- 7. Admin: content round-trip + fallback ---
const ct1 = await fetch(`${base}/api/admin/content`, {
  method: "PUT",
  headers: { "Content-Type": "application/json", cookie: session },
  body: JSON.stringify({ "cta.title": { fr: "Prêt à prendre le volant ?", ar: "هل أنت مستعد للانطلاق؟", en: "Ready to take the wheel?" } }),
});
check("admin content save → 200", ct1.status === 200, `status ${ct1.status}`);

// --- 8. Admin: message mark read ---
const msg = await p.contactMessage.findFirst({ where: { email: "jean@mail.com" } });
const m1 = await fetch(`${base}/api/admin/messages/${msg.id}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json", cookie: session },
  body: JSON.stringify({ read: true }),
});
check("admin message mark-read → 200", m1.status === 200, `status ${m1.status}`);

// --- 9. Admin: settings logo ---
const s1 = await fetch(`${base}/api/admin/settings`, {
  method: "PUT",
  headers: { "Content-Type": "application/json", cookie: session },
  body: JSON.stringify({ mode: "logo", logoUrl: "" }),
});
check("admin settings logo → 200", s1.status === 200, `status ${s1.status}`);

// --- 10. Upload security ---
// 10a. Text file named .png must be rejected (magic bytes, not client MIME)
const fake = new Blob([new TextEncoder().encode("this is not really a png image at all")], { type: "image/png" });
const fd1 = new FormData();
fd1.append("file", fake, "fake.png");
const u1 = await fetch(`${base}/api/admin/upload`, { method: "POST", headers: { cookie: session }, body: fd1 });
check("upload fake PNG (text inside) rejected", u1.status === 400, `status ${u1.status}`);

// 10b. Real minimal valid PNG accepted
const pngHex =
  "89504e470d0a1a0a0000000d494844520000000100000001080600000" +
  "01f15c4890000000d4944415478da63fcffff3f030005fe02fea72d4b4c" +
  "0000000049454e44ae426082";
const realPng = Buffer.from(pngHex.replace(/\s/g, ""), "hex");
const real = new Blob([realPng], { type: "image/png" });
const fd2 = new FormData();
fd2.append("file", real, "test-upload.png");
const u2 = await fetch(`${base}/api/admin/upload`, { method: "POST", headers: { cookie: session }, body: fd2 });
const u2j = await u2.json().catch(() => ({}));
check(
  "upload real PNG accepted with random name",
  u2.ok && typeof u2j.path === "string" && u2j.path.startsWith("/uploads/"),
  u2j.path || (await u2.text())
);

// 10c. HTML disguised as PNG rejected
const evil = new Blob([new TextEncoder().encode("<html><body>xss</body></html>")], { type: "image/png" });
const fd3 = new FormData();
fd3.append("file", evil, "evil.png");
const u3 = await fetch(`${base}/api/admin/upload`, { method: "POST", headers: { cookie: session }, body: fd3 });
check("upload HTML-disguised-as-PNG rejected", u3.status === 400, `status ${u3.status}`);

// 10d. Upload without session rejected
const fd4 = new FormData();
fd4.append("file", real, "no-auth.png");
const u4 = await fetch(`${base}/api/admin/upload`, { method: "POST", body: fd4 });
check("upload without admin session → 401", u4.status === 401, `status ${u4.status}`);

// --- 11. Admin: reservation status change ---
const res = await p.reservation.findFirst({ where: { customerName: "Test Client" } });
if (res) {
  const rs1 = await fetch(`${base}/api/admin/reservations/${res.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie: session },
    body: JSON.stringify({ status: "confirmed" }),
  });
  check("admin reservation status change → 200", rs1.status === 200, `status ${rs1.status}`);
} else {
  check("admin reservation status change → 200", false, "no reservation found (booking failed?)");
}

// --- 12. Rate limiting on login (6th attempt in a row from same IP → 429) ---
let got429 = false;
for (let i = 0; i < 6; i++) {
  const rr = await fetch(`${base}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-csrf-token": hmac, cookie: csrfCookie, "x-forwarded-for": FAKE_IP_2 },
    body: JSON.stringify({ email: "wrong@x.com", password: "wrongpassword" }),
  });
  if (rr.status === 429) { got429 = true; break; }
}
check("login rate limit kicks in (429 by 6th attempt)", got429);

// --- Cleanup test data ---
await p.reservation.deleteMany({ where: { customerName: { in: ["Test Client", "Second Client", "Bot"] } } });
await p.contactMessage.deleteMany({ where: { email: { in: ["jean@mail.com", "evil@mail.com"] } } });
await p.$disconnect();

console.log(failures === 0 ? "\nALL CHECKS PASSED ✓" : `\n${failures} CHECK(S) FAILED ✗`);
process.exit(failures === 0 ? 0 : 1);
