import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

// Where the browser is allowed to call the API from (for the Content-Security-Policy below).
function apiOrigin(): string {
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

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Allow images from Supabase and Unsplash (keep in sync with src/lib/imageHosts.ts)
  images: {
    formats: ['image/avif', 'image/webp'],
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
