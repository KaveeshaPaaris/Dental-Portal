import { MetadataRoute } from 'next';
import { ALLOW_INDEXING, SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  // Indexing off (staging / not launched yet): ask every crawler to stay away, advertise no sitemap.
  if (!ALLOW_INDEXING) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/admin/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
