/**
 * Hosts that next/image is allowed to optimise (must match `images.remotePatterns`
 * in next.config.mjs). next/image throws an error for any other remote host, which
 * would crash the whole page, so images from other hosts are shown unoptimised instead.
 */
export function canOptimizeImage(src: string | null | undefined): boolean {
  if (!src) return false;
  if (src.startsWith('/')) return true; // local file in /public
  try {
    const { protocol, hostname } = new URL(src);
    if (protocol !== 'https:') return false;
    return hostname.endsWith('.supabase.co') || hostname === 'images.unsplash.com';
  } catch {
    return false;
  }
}
