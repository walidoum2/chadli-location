import crypto from "crypto";
import fs from "fs";

const base = "http://localhost:50287";
const secret = fs.readFileSync(".env", "utf8").match(/SESSION_SECRET=(\S+)/)?.[1];

const r1 = await fetch(`${base}/admin/login`);
const cookies = r1.headers.getSetCookie?.() || [];
console.log("Set-Cookie headers on GET /admin/login:");
cookies.forEach((c, i) => console.log(`  [${i}] ${c.slice(0, 90)}`));

const csrfCookie = cookies.find((c) => c.startsWith("chadli_csrf="))?.split(";")[0];
if (!csrfCookie) {
  console.log("NO CSRF COOKIE — middleware did not set it");
  process.exit(1);
}
const cookieVal = csrfCookie.split("=")[1];
console.log("cookie value length:", cookieVal.length);
console.log("cookie value:", cookieVal);

const hmac = crypto.createHmac("sha256", secret).update(cookieVal).digest("base64url");
console.log("computed hmac:", hmac);

const r2 = await fetch(`${base}/api/admin/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-csrf-token": hmac,
    cookie: csrfCookie,
  },
  body: JSON.stringify({ email: "admin@chadli-location.dz", password: "Chadli2026!" }),
});
console.log("POST /api/admin/login:", r2.status, await r2.text());

// Also try a second request with the SAME cookie (simulating browser revisit)
const r3 = await fetch(`${base}/api/admin/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-csrf-token": hmac,
    cookie: csrfCookie,
  },
  body: JSON.stringify({ email: "admin@chadli-location.dz", password: "Chadli2026!" }),
});
console.log("POST again (same cookie):", r3.status, await r3.text());
