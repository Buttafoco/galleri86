// Narrow the remote image allowlist to this project's own Supabase storage
// host (derived from the same env var the app already uses), falling back to
// the generic *.supabase.co pattern only if that env var isn't set at build
// time — so next/image can optimize admin-uploaded photos without opening
// the door to arbitrary remote hosts.
function supabaseImagePattern() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (url) {
    try {
      return { protocol: "https", hostname: new URL(url).hostname, pathname: "/storage/v1/object/public/**" };
    } catch {
      // fall through to the wildcard below
    }
  }
  return { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" };
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [supabaseImagePattern()],
  },
  async headers() {
    return [
      {
        // Static, build-committed image assets under /public/assets. Their
        // filenames are NOT content-hashed (e.g. "hero-main.jpg" stays
        // "hero-main.jpg" forever) — Next only hashes /_next/static output,
        // never /public files — so a future deploy can change what this exact
        // URL serves. `immutable, max-age=1y` would be wrong here: a browser
        // or the CDN edge could keep serving the old bytes for a year after
        // a legitimate replacement. Use a short freshness window with
        // stale-while-revalidate instead, so repeat views stay fast (served
        // from cache while it's still fresh, or instantly from the stale
        // copy while a fresh one is fetched in the background) but a swapped
        // file is picked up within the hour rather than up to a year later.
        // Admin-uploaded photos live in Supabase Storage under unique
        // per-upload URLs instead (see lib/content-client.ts) and go through
        // next/image's own separate, short-TTL cache — unaffected by this
        // rule, which only matches literal /assets/* requests.
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
