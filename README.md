# Chadli Location — Site de location de voitures

Full-stack car rental website with admin panel for **Chadli Location** (Algeria).
Next.js 16 (App Router) · Tailwind CSS 4 · Prisma + SQLite (swappable to PostgreSQL) ·
trilingual (FR / AR / EN) with full RTL support.

## Quick start

```bash
npm install
cp .env.example .env        # then edit the values
npx prisma migrate dev      # creates the database + tables
npx prisma db seed          # sample cars + default site content + admin account
npm run dev                 # http://localhost:3000
```

- Public site: `http://localhost:3000/fr` (also `/ar`, `/en`)
- Admin panel: `http://localhost:3000/admin` → login at `/admin/login`

Default admin credentials come from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`
(fallback: `admin@chadli-location.dz` / `Chadli2026!` — **change them immediately**
in Settings, or better, in `.env` before first seed).

## Environment variables (`.env`)

| Variable         | Purpose                                              |
| ---------------- | ---------------------------------------------------- |
| `DATABASE_URL`   | `file:./dev.db` for SQLite; a Postgres URL in prod   |
| `SESSION_SECRET` | HMAC key for admin session cookies (any long random) |
| `NEXTAUTH_SECRET`| Fallback for `SESSION_SECRET`                        |
| `ADMIN_EMAIL`    | Seed-time admin login email                          |
| `ADMIN_PASSWORD` | Seed-time admin password (bcrypt-hashed, never stored plaintext) |

Generate a secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Project structure

```
prisma/schema.prisma        Car, Reservation, ContactMessage, SiteContent, Admin
prisma/seed.ts              4 sample cars (fr/ar/en) + all default site content
src/middleware.ts           Locale routing, admin fast-path guard, CSRF cookie
src/lib/                    db, auth (signed sessions), csrf, rate-limit, validation (Zod),
                            availability (overlap queries), uploads (magic-byte checks), i18n
src/app/[locale]/           Public site: home, /flotte, /flotte/[id], /contact
src/app/admin/(protected)/  Guarded admin: dashboard, cars, reservations, content, messages, settings
src/app/admin/login/        Public login page
src/app/api/                booking, contact (public) + admin/* (session-guarded)
```

## Features

### Public site
- Apple-style dark hero → light sections, glass nav + search bar, car photo reflections,
  fade/slide-up entrance animations via IntersectionObserver, `prefers-reduced-motion` respected.
- **Functional availability search**: date range is carried to `/flotte` and cars already
  booked (status `pending`/`confirmed`, overlapping dates) are excluded.
- Booking form creates a `Reservation` (status `pending`) with server-side double-booking check.
- Contact form stores messages in the DB.

### Admin panel
- Dashboard, Fleet manager (CRUD + multi-photo upload), Reservations manager
  (status changes + filters), Content editor (every public string, fr/ar/en),
  Messages (read/unread), Settings (password change, logo).
- Session auth: HMAC-signed HttpOnly cookie, bcrypt passwords, 5 attempts / 15 min
  rate limit, CSRF double-submit tokens, session revocation on password change.
- Admin UI labels available in FR/AR/EN (switcher in the header); RTL flips the layout.

### i18n / RTL
- URL-prefixed locales `/fr`, `/ar`, `/en`; French is the fallback for any blank translation.
- Arabic sets `dir="rtl"` on `<html>`, swaps to IBM Plex Sans Arabic, and mirrors nav,
  search bar, cards and admin layout via logical CSS properties.

## Swapping to PostgreSQL / cloud uploads

- `prisma/schema.prisma`: change `provider = "sqlite"` → `"postgresql"`, point
  `DATABASE_URL` at your Postgres/Supabase URL, run `npx prisma migrate dev`.
- Uploads: replace `saveFile` in `src/lib/uploads.ts` with a Cloudinary/S3/Supabase
  call — the rest of the code only depends on the returned public URL.

## Security summary

- Zod validation + HTML stripping on every form input, honeypot fields on public forms.
- Rate limits: login 5/15 min (15 min lockout), booking & contact 3/min.
- Uploads: magic-byte sniffing (JPG/PNG/WebP), 5 MB cap, random filenames.
- Sessions: `HttpOnly`, `SameSite=Strict`, `Secure` in production; secrets only via env vars.
