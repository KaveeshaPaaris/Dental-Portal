import { MetadataRoute } from 'next';
import { apiFetch } from '@/lib/apiFetch';
import { getServices } from '@/data/services';
import { ALLOW_INDEXING } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Not launched yet: advertise nothing.
  if (!ALLOW_INDEXING) return [];

  const baseUrl = 'https://charmingdental.lk';

  // Static routes
  const routes = [
    '',
    '/about',
    '/services',
    '/blogs',
    '/contact',
    '/book',
    '/ask',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // If the API is down these throw, so the sitemap request fails and crawlers retry later.
  // (Returning a sitemap with the blog/service URLs silently missing could make search
  // engines think those pages were removed.)
  const [blogsRes, services] = await Promise.all([
    apiFetch<{ data?: { slug: string; updated_at?: string; published_at?: string }[] }>('/blogs?limit=1000', 3600),
    getServices(),
  ]);

  const blogRoutes = (blogsRes?.data || []).map((blog) => ({
    url: `${baseUrl}/blogs/${blog.slug}`,
    lastModified: blog.updated_at || blog.published_at || new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const serviceRoutes = services.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...routes, ...serviceRoutes, ...blogRoutes];
}
