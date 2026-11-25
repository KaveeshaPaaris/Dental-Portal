import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Strict mode for better DX
  reactStrictMode: true,

  output: 'standalone',

  // The shared host caps the whole account at 120 processes, and all three apps rebuild at once
  // on every merge to main. Next starts one build worker per CPU core it sees (the HOST's cores,
  // dozens on a shared server), so keep this build to a few workers like public-web does.
  experimental: {
    cpus: 2,
  },

  // Allow images from common external sources
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
