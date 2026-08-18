import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

/** Server-side Supabase client (Server Components, Route Handlers, Server Actions).
 * Reads the current user's session from cookies, so RLS policies that check
 * auth.role() work the same as they do in the browser. */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabaseEnv();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component render (not a Route Handler/Server
          // Action) — middleware refreshes the session cookie instead.
        }
      },
    },
  });
}
