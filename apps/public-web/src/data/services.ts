import {
  Stethoscope, Sparkles, Shield, Sun, Wand2, Layers,
  HeartPulse, Scissors, Crown, Anchor, Smile, AlignCenter,
  Activity, Baby,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ServiceCategory = 'Preventive' | 'Cosmetic' | 'Restorative' | 'Orthodontics';

export interface ServiceBenefit {
  icon?: string | LucideIcon;
  title: string;
  desc: string;
}

export interface ServiceStep {
  title: string;
  desc: string;
}

export interface ServiceFaq {
  q: string;
  a: string;
}

export interface Service {
  id?: string;
  slug: string;
  title: string;
  category: ServiceCategory | string;
  icon: string | LucideIcon;
  image: string;
  showBeforeAfter: boolean;
  beforeImage?: string;
  afterImage?: string;
  standaloneImage?: string;
  shortDesc: string;
  listingDesc: string;
  highlights: string[];
  featured: boolean;
  heroSummary: string;
  whatIs: string;
  whoBenefits: string[];
  benefits: ServiceBenefit[];
  steps: ServiceStep[];
  beforeCare: string[];
  afterCare: string[];
  faqs: ServiceFaq[];
  relatedSlugs: string[];
  intro?: string;
  commonSigns?: string[];
  bottomLine?: string;
}

export const REVIEWER_INFO = {
  name: 'Dr. Chaaminda Paaris',
  credentials: 'Dental Surgeon',
  dateUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

// Helper to map string icon names back to Lucide components if needed
// Or we can just use the icon name in the UI components
const ICON_MAP: Record<string, LucideIcon> = {
  Stethoscope, Sparkles, Shield, Sun, Wand2, Layers,
  HeartPulse, Scissors, Crown, Anchor, Smile, AlignCenter,
  Activity, Baby,
};

function mapService(dbService: any): Service {
  return {
    id: dbService.id,
    slug: dbService.slug,
    title: dbService.title,
    category: dbService.category,
    icon: ICON_MAP[dbService.icon] || dbService.icon,
    image: dbService.slug === 'teeth-whitening' ? '/teeth whitning.jpg' : (dbService.slug === 'dental-fillings' ? '/toot_filling .jpg' : dbService.image),
    showBeforeAfter: dbService.show_before_after,
    beforeImage: dbService.before_image,
    afterImage: dbService.after_image,
    standaloneImage: dbService.slug === 'teeth-whitening' ? '/teeth whitning.jpg' : (dbService.slug === 'dental-fillings' ? '/toot_filling .jpg' : dbService.standalone_image),
    shortDesc: dbService.short_desc,
    listingDesc: dbService.listing_desc,
    highlights: dbService.highlights,
    featured: dbService.featured,
    heroSummary: dbService.hero_summary,
    whatIs: dbService.what_is,
    whoBenefits: dbService.who_benefits,
    benefits: dbService.benefits,
    steps: dbService.steps,
    beforeCare: dbService.before_care,
    afterCare: dbService.after_care,
    faqs: dbService.faqs,
    relatedSlugs: dbService.related_slugs,
  };
}

export async function getServices(): Promise<Service[]> {
  try {
    const res = await fetch(`${API_URL}/services`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(mapService);
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return [];
  }
}

export async function getFeaturedServices(): Promise<Service[]> {
  const services = await getServices();
  return services.filter(s => s.featured);
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  try {
    const res = await fetch(`${API_URL}/services/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    return mapService(data);
  } catch (error) {
    console.error(`Failed to fetch service ${slug}:`, error);
    return null;
  }
}

export async function getRelatedServices(slugs: string[]): Promise<Service[]> {
  const services = await getServices();
  return services.filter(s => slugs.includes(s.slug));
}