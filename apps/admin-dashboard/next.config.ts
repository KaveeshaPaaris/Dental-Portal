import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Strict mode for better DX
  reactStrictMode: true,

  // Standalone output: bundles only required node_modules for deployment
  // Required for Hostinger Node.js hosting (no node_modules at runtime)
  output: 'standalone',

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
