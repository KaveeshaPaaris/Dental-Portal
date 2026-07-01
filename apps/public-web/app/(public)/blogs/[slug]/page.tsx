import { Metadata } from 'next';
import api from '@/lib/api';
import ClientBlogDetail from './ClientBlogDetail';
import { notFound } from 'next/navigation';

const baseUrl = 'https://charmingdental.com';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const res = await api.get(`/blogs/${resolvedParams.slug}`);
    const blog = res.data;
    const url = `${baseUrl}/blogs/${blog.slug}`;
    
    return {
      title: `${blog.title} — Dental Health Blog`,
      description: blog.meta_description || blog.excerpt,
      keywords: blog.seo_keywords || 'dental blog, charming dental clinic, oral health',
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: blog.title,
        description: blog.meta_description || blog.excerpt,
        url,
        siteName: 'Charming Dental Clinic',
        images: blog.cover_image ? [{ url: blog.cover_image, alt: blog.title }] : [],
        type: 'article',
        publishedTime: blog.published_at,
        modifiedTime: blog.updated_at || blog.published_at,
        authors: blog.author ? [blog.author] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.title,
        description: blog.meta_description || blog.excerpt,
        images: blog.cover_image ? [blog.cover_image] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Blog Article Not Found',
    };
  }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  let blog;
  
  try {
    const res = await api.get(`/blogs/${resolvedParams.slug}`);
    blog = res.data;
  } catch (err) {
    notFound();
  }

  const url = `${baseUrl}/blogs/${blog.slug}`;

  // Article Structured Data (JSON-LD)
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.meta_description || blog.excerpt,
    image: blog.cover_image ? [blog.cover_image] : [],
    datePublished: blog.published_at,
    dateModified: blog.updated_at || blog.published_at,
    author: {
      '@type': 'Person',
      name: blog.author || 'Charming Dental Clinic',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Charming Dental Clinic',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`, // Placeholder for actual logo URL
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blogs',
        item: `${baseUrl}/blogs`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: blog.title,
        item: url,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ClientBlogDetail slug={resolvedParams.slug} />
    </>
  );
}
