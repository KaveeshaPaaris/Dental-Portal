import 'dotenv/config';
import { SERVICES } from './old_services';
import * as servicesService from '../src/modules/services/services.service';

async function run() {
  console.log('🦷 Starting Services Migration & AI Sync...');
  
  for (const service of SERVICES) {
    console.log(`Migrating: ${service.title}`);
    
    // Check if it already exists
    try {
      const existing = await servicesService.getServiceBySlug(service.slug);
      if (existing) {
        console.log(` - Already exists, updating...`);
        await servicesService.updateService(existing.id, service);
        continue;
      }
    } catch (err: any) {
      if (err.statusCode !== 404) {
        console.error('Error checking existence:', err);
      }
    }

    try {
      // Create it
      await servicesService.createService({
        slug: service.slug,
        title: service.title,
        category: service.category,
        icon: service.icon?.displayName || service.icon?.name || 'Icon', // Store string representation or handle gracefully
        image: service.image,
        show_before_after: service.showBeforeAfter,
        before_image: service.beforeImage,
        after_image: service.afterImage,
        standalone_image: service.standaloneImage,
        short_desc: service.shortDesc,
        listing_desc: service.listingDesc,
        highlights: service.highlights,
        featured: service.featured,
        hero_summary: service.heroSummary,
        what_is: service.whatIs,
        who_benefits: service.whoBenefits,
        benefits: service.benefits,
        steps: service.steps,
        before_care: service.beforeCare,
        after_care: service.afterCare,
        faqs: service.faqs,
        related_slugs: service.relatedSlugs,
        is_published: true
      });
      console.log(` - Successfully created & synced to Knowledge Base!`);
    } catch (err) {
      console.error(` - Error creating ${service.title}:`, err);
    }
  }

  console.log('✅ Migration complete! Allow a few seconds for the background AI embedding jobs to finish.');
  process.exit(0);
}

run();
