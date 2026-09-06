import { redirect } from "next/navigation";

// Public site lives under /fr /ar /en (handled by middleware) —
// this root page only catches direct hits that bypass middleware.
export default function RootPage() {
  redirect("/fr");
}
