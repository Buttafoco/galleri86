import AdminApp from "@/components/admin/AdminApp";
import { getDraftContent, getPublishedContent } from "@/lib/content-store";

export const metadata = {
  title: "Galleri 86 – Redigeringsläge",
};

// Auth is enforced by middleware.ts (redirects to /admin/login when signed
// out); this route can assume a session exists. Always read fresh so the
// editor never opens on a stale draft.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [draft, published] = await Promise.all([getDraftContent(), getPublishedContent()]);
  return <AdminApp initialDraft={draft} initialPublished={published} />;
}
