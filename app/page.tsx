import GallerySite from "@/components/GallerySite";
import { getPublishedContent } from "@/lib/content-store";

// Always read the live published row from Supabase — never a cached/stale
// build-time snapshot — so publishing from /admin shows up immediately.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getPublishedContent();
  return <GallerySite content={content} mode="public" />;
}
