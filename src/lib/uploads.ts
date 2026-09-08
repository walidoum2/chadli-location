import "server-only";
import { mkdir, writeFile } from "fs/promises";
import { randomBytes } from "crypto";
import path from "path";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export interface UploadResult {
  ok: boolean;
  path?: string; // public URL path, e.g. /uploads/abc123.jpg
  error?: string;
}

/** Magic byte signatures — the client-supplied MIME header is never trusted. */
function detectType(buf: Uint8Array): string | null {
  if (buf.length < 12) return null;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return "image/png";
  }
  // WEBP: "RIFF"...."WEBP"
  const riff = String.fromCharCode(buf[0], buf[1], buf[2], buf[3]);
  const webp = String.fromCharCode(buf[8], buf[9], buf[10], buf[11]);
  if (riff === "RIFF" && webp === "WEBP") return "image/webp";
  return null;
}

/**
 * Validate and store an uploaded image.
 * - magic-byte sniffing (not the client-controlled MIME header)
 * - random filename, never user input
 * - size cap before buffering the whole file
 * - stored under public/uploads (dev). For cloud storage, replace saveFile()
 *   with an S3/Cloudinary/Supabase call — the returned URL shape stays the same.
 */
export async function saveUpload(file: File): Promise<UploadResult> {
  if (!file || typeof file.size !== "number") {
    return { ok: false, error: "Fichier invalide." };
  }
  if (file.size === 0) return { ok: false, error: "Fichier vide." };
  if (file.size > MAX_SIZE) {
    return { ok: false, error: "Fichier trop volumineux (max 5 Mo)." };
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_SIZE) {
    return { ok: false, error: "Fichier trop volumineux (max 5 Mo)." };
  }

  const sniffed = detectType(buf);
  if (!sniffed || !ALLOWED[sniffed]) {
    return { ok: false, error: "Format non autorisé (JPG, PNG ou WebP uniquement)." };
  }

  const name = `${Date.now().toString(36)}-${randomBytes(12).toString("hex")}.${ALLOWED[sniffed]}`;
  const outDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, name), buf);

  return { ok: true, path: `/uploads/${name}` };
}
