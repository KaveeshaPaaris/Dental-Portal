import {
  Stethoscope, Sparkles, Shield, Sun, Wand2, Layers,
  HeartPulse, Scissors, Crown, Anchor, Smile, AlignCenter,
  Activity, Baby,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { apiFetch } from '@/lib/apiFetch';

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

// Both fetchers throw if the API is unreachable/erroring (see apiFetch) so a temporary
// outage never overwrites a good cached page with an empty one.
export async function getServices(): Promise<Service[]> {
  const data = await apiFetch<any[]>('/services', 60);
  return (data ?? []).map(mapService);
}

export async function getFeaturedServices(): Promise<Service[]> {
  const services = await getServices();
  return services.filter(s => s.featured);
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  // null only when the API says 404 (service really doesn't exist)
  const data = await apiFetch<any>(`/services/${encodeURIComponent(slug)}`, 60);
  return data ? mapService(data) : null;
}

export async function getRelatedServices(slugs: string[]): Promise<Service[]> {
  const services = await getServices();
  return services.filter(s => slugs.includes(s.slug));
}