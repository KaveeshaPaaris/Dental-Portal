// Plain .mjs on purpose: with a next.config.ts, Next loads its Rust compiler (SWC) when the server
// starts just to read this file, and that compiler keeps one thread per CPU core of the HOST alive
// (64 on Hostinger). The shared plan allows only 120 processes/threads for the whole account.

const isDev = process.env.NODE_ENV !== 'production';

// Where the browser is allowed to call the API from (for the Content-Security-Policy below).
function apiOrigin() {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').origin;
  } catch {
    return '';
  }
}

// Content-Security-Policy in REPORT-ONLY mode: the browser logs anything that would be blocked
// (see the console, "Content Security Policy" messages) but blocks nothing, so it cannot break
// the site. After browsing every page with no warnings, rename the header below to
// 'Content-Security-Policy' to start enforcing it.
const cspReportOnly = [
  "default-src 'self'",
  // Next.js needs inline scripts; dev mode also needs eval.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  'frame-src https://www.google.com', // Google Maps embed
  `connect-src 'self' ${apiOrigin()}`.trim(),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  // Other sites may not show ours inside a frame (clickjacking protection).
  { key: 'X-Frame-Options', value: 'DENY' },
  // Browser must trust the declared file type instead of guessing.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Send only the site name (not the full URL) to other sites, e.g. when clicking a map link.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Features this site never uses are switched off.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Content-Security-Policy-Report-Only', value: cspReportOnly },
  // Hidden from search engines until ALLOW_INDEXING=true (kept in sync with src/lib/site.ts).
  ...(process.env.ALLOW_INDEXING === 'true' ? [] : [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // The shared host caps the whole account at 120 processes. Next starts one build worker per CPU
  // core it sees, and on a shared server it sees the HOST's cores (dozens), so every deploy could
  // hit the cap and take the site down with a 503. Keep the build to a few workers.
  experimental: {
    cpus: 2,
  },

  // Allow images from Supabase and Unsplash (keep in sync with src/lib/imageHosts.ts)
  images: {
    // WebP only: AVIF encoding is far heavier on a small shared host and the images are already small.
    formats: ['image/webp'],
    // Fewer sizes = fewer optimised copies to generate. (Defaults also include 2048 and 3840.)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Keep optimised images cached for 30 days so they are not regenerated again and again.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
