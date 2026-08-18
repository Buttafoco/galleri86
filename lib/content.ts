import type { SiteContent } from "./types";

/**
 * The site's content is no longer hardcoded here — it lives in Supabase
 * (the `site_content` table, see supabase-setup.sql, which also seeds it).
 * The public homepage (app/page.tsx) and /admin (app/admin/page.tsx) both
 * read through lib/content-store.ts, and /admin writes through
 * lib/content-client.ts, so there is exactly one source of truth and the
 * two can never drift apart.
 */

/**
 * Older Supabase rows predate the dedicated upcoming-exhibitions list. Keep
 * them working by deriving the same three rows from the exhibition cards
 * until an admin saves the new list for the first time.
 */
export function normalizeContent(content: SiteContent): SiteContent {
  const stored = (content as SiteContent & { upcomingExhibitions?: unknown }).upcomingExhibitions;
  const upcomingExhibitions = Array.isArray(stored)
    ? stored.map((item, index) => ({
        key: typeof item?.key === "string" ? item.key : `upcoming-${index}`,
        name: typeof item?.name === "string" ? item.name : "",
        date: typeof item?.date === "string" ? item.date : "",
      }))
    : content.artists
        .filter((artist) => !artist.hidden && artist.name !== content.texts.curTitle)
        .map((artist) => ({ key: `upcoming-${artist.key}`, name: artist.name, date: artist.date }));

  return { ...content, upcomingExhibitions };
}

/** Deep clone used when seeding local editor state from server-fetched content. */
export function cloneContent(content: SiteContent): SiteContent {
  const normalized = normalizeContent(content);
  return {
    images: Object.fromEntries(
      Object.entries(normalized.images).map(([k, v]) => [k, { ...v }]),
    ) as SiteContent["images"],
    artists: normalized.artists.map((a) => ({ ...a })),
    upcomingExhibitions: normalized.upcomingExhibitions.map((item) => ({ ...item })),
    collage: normalized.collage.map((c) => ({ ...c })),
    texts: { ...normalized.texts },
    schedule: normalized.schedule.map((d) => ({ ...d })),
  };
}
