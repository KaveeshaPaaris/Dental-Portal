import { MetadataRoute } from 'next';
import api from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://charmingdental.com';

  // Static routes
  const routes = [
    '',
    '/about',
    '/services',
    '/blogs',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic routes for blogs
  try {
    // Fetch up to 1000 published blogs for the sitemap
    const res = await api.get('/blogs?limit=1000');
    const blogs = res.data?.data || [];

    const blogRoutes = blogs.map((blog: any) => ({
      url: `${baseUrl}/blogs/${blog.slug}`,
      lastModified: blog.updated_at || blog.published_at || new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    return [...routes, ...blogRoutes];
  } catch (error) {
    console.error('Failed to generate dynamic sitemap for blogs:', error);
    // If API fails, just return static routes
    return routes;
  }
}
