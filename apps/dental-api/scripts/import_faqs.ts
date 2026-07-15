import 'dotenv/config';
import { supabase } from '../src/config/supabase';
import { regenerateChunks } from '../src/modules/knowledge-base/chunks.service';
import { MASTER_FAQS } from '../data/master_faqs';

async function run() {
  console.log('🦷 Starting Comprehensive FAQ Migration & AI Sync...\n');

  for (const category of MASTER_FAQS) {
    console.log(`Migrating Category: ${category.title}`);

    // We create one comprehensive article per category for optimal RAG context grouping
    let content = `# ${category.title}\n\n`;

    for (const q of category.questions) {
      content += `## ${q.q}\n\n`;
      content += `**Quick Answer:** ${q.short}\n\n`;
      content += `**Detailed Explanation:** ${q.detailed}\n\n`;
      
      if (q.synonyms && q.synonyms.length > 0) {
        content += `*Patients also ask: ${q.synonyms.join(', ')}*\n\n`;
      }
      if (q.followUps && q.followUps.length > 0) {
        content += `*Related Questions: ${q.followUps.join(', ')}*\n\n`;
      }
      content += `---\n\n`;
    }

    // Check if article exists
    const { data: existing } = await supabase
      .from('knowledge_base')
      .select('id')
      .eq('title', category.title)
      .single();

    let articleId = existing?.id;

    if (articleId) {
      // Update
      const { error } = await supabase
        .from('knowledge_base')
        .update({
          content,
          category: category.category,
          updated_at: new Date().toISOString(),
          status: 'PUBLISHED'
        })
        .eq('id', articleId);
      
      if (error) {
        console.error(` ❌ Error updating ${category.title}:`, error);
        continue;
      }
    } else {
      // Insert
      const { data, error } = await supabase
        .from('knowledge_base')
        .insert({
          title: category.title,
          category: category.category,
          content,
          status: 'PUBLISHED'
        })
        .select('id')
        .single();
      
      if (error || !data) {
        console.error(` ❌ Error inserting ${category.title}:`, error);
        continue;
      }
      articleId = data.id;
    }

    // Regenerate Chunks
    try {
      await regenerateChunks(articleId, category.title, content);
      console.log(` - Successfully created & synced to Knowledge Base!`);
    } catch (err) {
      console.error(` ❌ Chunking failed for ${category.title}:`, err);
    }
  }

  console.log('\n✅ FAQ Migration complete! The AI is now a world-class assistant.');
  process.exit(0);
}

run();
