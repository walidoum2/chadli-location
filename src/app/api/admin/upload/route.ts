import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { saveUpload } from "@/lib/uploads";

export const dynamic = "force-dynamic";

// POST /api/admin/upload — car photo upload (admin only).
// Validation lives in saveUpload: magic-byte sniffing, 5MB cap,
// random filename. Swap saveFile() there for cloud storage later.
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }

  const result = await saveUpload(file);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, path: result.path });
}
