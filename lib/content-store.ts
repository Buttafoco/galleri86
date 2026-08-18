import { createClient } from "./supabase/server";
import type { SiteContent } from "./types";
import { normalizeContent } from "./content";

/** Server-side reads used by app/page.tsx and app/admin/page.tsx. RLS makes the
 * "published" row world-readable and the "draft" row readable only to a
 * signed-in admin — see supabase-setup.sql. */

export async function getPublishedContent(): Promise<SiteContent> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_content").select("data").eq("state", "published").single();
  if (error) throw new Error(`Failed to load published content: ${error.message}`);
  return normalizeContent(data.data as SiteContent);
}

export async function getDraftContent(): Promise<SiteContent> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_content").select("data").eq("state", "draft").single();
  if (error) throw new Error(`Failed to load draft content: ${error.message}`);
  return normalizeContent(data.data as SiteContent);
}
