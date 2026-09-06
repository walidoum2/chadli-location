import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["fr", "ar", "en"];
const DEFAULT_LOCALE = "fr";
const SESSION_COOKIE = "chadli_admin_session";
const CSRF_COOKIE = "chadli_csrf";
const CSRF_MAX_AGE = 60 * 60 * 8; // 8h

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const secure = process.env.NODE_ENV === "production";
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  // --- Admin protection (pages re-verify the session; this is the fast path) ---
  if (first === "admin" && pathname !== "/admin/login") {
    if (!req.cookies.get(SESSION_COOKIE)?.value) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = `?next=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
  }

  // --- CSRF cookie for admin forms ---
  // Cookies can't be set during a server render, so middleware issues it.
  // On first visit the fresh token is ALSO injected into the request cookie
  // header, so the login form rendered in this same pass is signed with the
  // exact value the browser is about to store (otherwise first-visit login 403s).
  if (first === "admin") {
    const existingCsrf = req.cookies.get(CSRF_COOKIE)?.value;
    const isNew = !existingCsrf;
    const csrf: string = existingCsrf ??
      crypto.randomUUID().replace(/-/g, "") +
      crypto.randomUUID().replace(/-/g, "");

    const headers = new Headers(req.headers);
    if (isNew) {
      const existing = headers.get("cookie");
      headers.set(
        "cookie",
        existing ? `${existing}; ${CSRF_COOKIE}=${csrf}` : `${CSRF_COOKIE}=${csrf}`
      );
    }

    const res = NextResponse.next({ request: { headers } });
    if (isNew) {
      res.cookies.set(CSRF_COOKIE, csrf, {
        httpOnly: true,
        sameSite: "strict",
        secure,
        maxAge: CSRF_MAX_AGE,
        path: "/",
      });
    }
    return res;
  }

  // --- Locale routing for public pages ---
  if (first && LOCALES.includes(first)) {
    // Carry the locale to server components via a request header.
    const headers = new Headers(req.headers);
    headers.set("x-chadli-locale", first);
    return NextResponse.next({ request: { headers } });
  }

  // API, static assets and files pass through untouched.
  if (
    first === "api" ||
    first === "_next" ||
    first === "uploads" ||
    (first && first.includes("."))
  ) {
    return NextResponse.next();
  }

  // Everything else (/, /flotte, ...) redirects to the default locale.
  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
