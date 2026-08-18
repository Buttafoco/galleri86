import { createClient } from "./supabase/client";
import type { SiteContent } from "./types";

/** Browser-side draft/publish writes + image uploads, used from /admin.
 * Every write goes through Supabase (site_content table + the
 * "site-images" storage bucket) so content is never held only in React
 * state — see supabase-setup.sql for the RLS policies that gate these. */

export async function saveDraftContent(content: SiteContent): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("site_content")
    .update({ data: content, updated_at: new Date().toISOString() })
    .eq("state", "draft");
  if (error) throw new Error(error.message);
}

export async function publishContent(content: SiteContent): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("site_content")
    .update({ data: content, updated_at: new Date().toISOString() })
    .eq("state", "published");
  if (error) throw new Error(error.message);
}

/** Uploads a file to the public "site-images" bucket and returns its
 * permanent public URL. Requires an authenticated session (RLS). */
export async function uploadImage(file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("site-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("site-images").getPublicUrl(path);
  return data.publicUrl;
}
