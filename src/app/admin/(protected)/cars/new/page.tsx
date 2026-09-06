import Link from "next/link";
import CarForm from "../CarForm";

export const dynamic = "force-dynamic";

export default function NewCarPage() {
  return (
    <div>
      <Link href="/admin/cars" className="text-sm font-semibold text-[var(--red)] hover:underline">
        ← Retour à la flotte
      </Link>
      <h1 className="font-display mt-2 text-2xl">Ajouter un véhicule</h1>
      <CarForm />
    </div>
  );
}
