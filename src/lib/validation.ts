import { z } from "zod";

/** Strip HTML/script fragments and control chars from free text. */
export function sanitizeText(s: string): string {
  return s
    .replace(/<[^>]*>/g, "") // remove any tag
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim();
}

const safeText = (min: number, max: number) =>
  z.string().transform(sanitizeText).pipe(z.string().min(min).max(max));

const optionalText = (max: number) =>
  z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().max(max))
    .optional()
    .or(z.literal(""));

// ---- Public forms ----

// Honeypot: NOT max(0) here — it must pass Zod so the route can silently
// drop the submission (a 400 would tell bots they were detected).
export const bookingSchema = z
  .object({
    carId: z.string().min(1).max(64),
    customerName: safeText(2, 120),
    phone: z
      .string()
      .transform(sanitizeText)
      .pipe(z.string().regex(/^[+0-9 ()\.-]{6,20}$/, "Téléphone invalide")),
    email: z.string().email().max(160).optional().or(z.literal("")),
    pickupAt: z.coerce.date(),
    returnAt: z.coerce.date(),
    pickupLocation: safeText(2, 120),
    website: z.string().max(500).optional(),
  })
  .refine((d) => d.returnAt > d.pickupAt, {
    message: "La date de retour doit être après le départ",
    path: ["returnAt"],
  })
  .refine((d) => d.pickupAt.getTime() > Date.now() - 60 * 60 * 1000, {
    message: "La date de départ doit être dans le futur",
    path: ["pickupAt"],
  });

export const contactSchema = z.object({
  name: safeText(2, 120),
  email: z.string().email().max(160),
  message: safeText(10, 2000),
  website: z.string().max(500).optional(), // honeypot — silently dropped in route
});

// ---- Admin forms ----

export const loginSchema = z.object({
  email: z.string().email().max(160),
  password: z.string().min(1).max(200),
  website: z.string().max(500).optional(), // honeypot — silently dropped in route
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1).max(200),
    newPassword: z
      .string()
      .min(10, "Minimum 10 caractères")
      .max(200)
      .regex(/[A-Z]/, "Doit contenir une majuscule")
      .regex(/[a-z]/, "Doit contenir une minuscule")
      .regex(/[0-9]/, "Doit contenir un chiffre"),
  });

// Car multilingual text: fr required, ar/en optional
const carLocalized = z.object({
  fr: safeText(1, 160),
  ar: z.string().max(160).optional().or(z.literal("")),
  en: z.string().max(160).optional().or(z.literal("")),
});

const carDescLocalized = z.object({
  fr: z.string().max(2000).optional().or(z.literal("")),
  ar: z.string().max(2000).optional().or(z.literal("")),
  en: z.string().max(2000).optional().or(z.literal("")),
});

export const carSchema = z.object({
  name: carLocalized,
  desc: carDescLocalized,
  category: z.enum(["Citadine", "Berline", "SUV", "Luxe"]),
  transmission: z.enum(["Manuelle", "Automatique"]),
  seats: z.coerce.number().int().min(2).max(9),
  fuel: z.enum(["Diesel", "Essence", "Hybride", "Electrique"]),
  pricePerDay: z.coerce.number().int().min(500).max(1_000_000),
  status: z.enum(["available", "unavailable"]),
  images: z.array(z.string().min(1).max(500)).max(12),
});
