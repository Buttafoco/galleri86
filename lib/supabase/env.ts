/** Shared, validated read of the public Supabase env vars. Both are safe to
 * expose to the browser — access control is enforced entirely by Supabase
 * Auth + the Row Level Security policies in supabase-setup.sql, not by
 * keeping these values secret. */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Missing Supabase env vars. Copy .env.local.example to .env.local and fill in " +
        "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY from your " +
        "Supabase project's Settings -> API page.",
    );
  }

  return { url, publishableKey };
}
