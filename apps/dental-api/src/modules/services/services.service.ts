import { supabase } from '../../config/supabase';
import { createError } from '../../middleware/error.middleware';
import { regenerateChunks } from '../knowledge-base/chunks.service';

/**
 * Format a Service object into a rich Markdown string specifically
 * optimized for the AI Knowledge Base retrieval and understanding.
 */
function formatServiceToMarkdown(service: any): string {
  let md = `# Service: ${service.title}\n\n`;
  md += `**Category:** ${service.category}\n\n`;
  md += `## Overview\n${service.hero_summary}\n\n`;
  md += `## What is it?\n${service.what_is}\n\n`;
  md += `## Description\n${service.listing_desc}\n\n`;

  if (service.highlights && service.highlights.length > 0) {
    md += `## Highlights\n`;
    service.highlights.forEach((h: string) => (md += `- ${h}\n`));
    md += `\n`;
  }

  if (service.who_benefits && service.who_benefits.length > 0) {
    md += `## Who Benefits\n`;
    service.who_benefits.forEach((w: string) => (md += `- ${w}\n`));
    md += `\n`;
  }

  if (service.benefits && service.benefits.length > 0) {
    md += `## Benefits\n`;
    service.benefits.forEach((b: any) => {
      md += `### ${b.title}\n${b.desc}\n\n`;
    });
  }

  if (service.steps && service.steps.length > 0) {
    md += `## Procedure Steps\n`;
    service.steps.forEach((s: any, idx: number) => {
      md += `${idx + 1}. **${s.title}**: ${s.desc}\n`;
    });
    md += `\n`;
  }

  if (service.before_care && service.before_care.length > 0) {
    md += `## Before Care / Preparation\n`;
    service.before_care.forEach((c: string) => (md += `- ${c}\n`));
    md += `\n`;
  }

  if (service.after_care && service.after_care.length > 0) {
    md += `## After Care / Post-Treatment\n`;
    service.after_care.forEach((c: string) => (md += `- ${c}\n`));
    md += `\n`;
  }

  if (service.faqs && service.faqs.length > 0) {
    md += `## Frequently Asked Questions (FAQ)\n`;
    service.faqs.forEach((faq: any) => {
      md += `**Q: ${faq.q}**\nA: ${faq.a}\n\n`;
    });
  }

  return md;
}

/**
 * Synchronize a service to the Knowledge Base.
 * Upserts a KB article and regenerates its chunks.
 */
async function syncServiceToKnowledgeBase(service: any) {
  const content = formatServiceToMarkdown(service);
  const kbTitle = `Service: ${service.title}`;

  if (service.kb_article_id) {
    // Update existing KB article
    const { error: kbError } = await supabase
      .from('knowledge_base')
      .update({
        title: kbTitle,
        category: 'Services',
        content,
        status: service.is_published ? 'PUBLISHED' : 'DRAFT',
        updated_at: new Date().toISOString(),
      })
      .eq('id', service.kb_article_id);

    if (kbError) console.error(`[KB Sync] Error updating KB article for service ${service.id}:`, kbError);
    else {
      // Regenerate chunks
      regenerateChunks(service.kb_article_id, kbTitle, content).catch(err => 
        console.error(`[KB Sync] Chunking failed for service ${service.id}:`, err)
      );
    }
  } else {
    // Create new KB article
    const { data: kbData, error: kbError } = await supabase
      .from('knowledge_base')
      .insert({
        title: kbTitle,
        category: 'Services',
        content,
        status: service.is_published ? 'PUBLISHED' : 'DRAFT',
      })
      .select('id')
      .single();

    if (kbError || !kbData) {
      console.error(`[KB Sync] Error creating KB article for service ${service.id}:`, kbError);
    } else {
      // Update service with the new kb_article_id
      await supabase.from('services').update({ kb_article_id: kbData.id }).eq('id', service.id);
      
      // Generate chunks
      regenerateChunks(kbData.id, kbTitle, content).catch(err => 
        console.error(`[KB Sync] Chunking failed for service ${service.id}:`, err)
      );
    }
  }
}

// ─── CRUD Operations ─────────────────────────────────────────────

export async function getAllServices(includeDrafts = false) {
  let query = supabase.from('services').select('*').order('created_at', { ascending: true });
  if (!includeDrafts) {
    query = query.eq('is_published', true);
  }
  const { data, error } = await query;
  if (error) throw createError('Failed to fetch services', 500);
  return data ?? [];
}

export async function getServiceBySlug(slug: string) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) throw createError('Service not found', 404);
  return data;
}

export async function createService(input: any) {
  const { data, error } = await supabase
    .from('services')
    .insert(input)
    .select('*')
    .single();

  if (error || !data) throw createError('Failed to create service', 500);

  // Sync to KB in background
  syncServiceToKnowledgeBase(data).catch(console.error);

  return data;
}

export async function updateService(id: string, input: any) {
  const { data, error } = await supabase
    .from('services')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) throw createError('Failed to update service', 500);

  // Sync to KB in background
  syncServiceToKnowledgeBase(data).catch(console.error);

  return data;
}

export async function deleteService(id: string) {
  // First get the service to find its KB article ID
  const { data: service } = await supabase.from('services').select('kb_article_id').eq('id', id).single();
  
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw createError('Failed to delete service', 500);

  if (service && service.kb_article_id) {
    const { error: kbDeleteError } = await supabase.from('knowledge_base').delete().eq('id', service.kb_article_id);
    if (kbDeleteError) console.error(kbDeleteError);
  }

  return { message: 'Service deleted successfully' };
}
