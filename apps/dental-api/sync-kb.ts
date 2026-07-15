import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { supabase } from './src/config/supabase';
import { regenerateChunks } from './src/modules/knowledge-base/chunks.service';

async function syncChunks() {
  console.log('--- STARTING KNOWLEDGE BASE SYNC ---');

  // 1. Fetch all articles with title and content
  const { data: articles, error } = await supabase.from('knowledge_base').select('id, title, content');
  
  if (error || !articles) {
    console.error('Failed to fetch articles:', error);
    return;
  }

  console.log(`Found ${articles.length} articles. Processing chunks...`);

  // 2. Generate chunks for each article
  for (const article of articles) {
    try {
      console.log(`Processing: "${article.title}"...`);
      // Pass all three required arguments
      await regenerateChunks(article.id, article.title, article.content);
      console.log(`  ✅ Chunks generated and embeddings requested.`);
      
      // Wait 1 second to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err: any) {
      console.error(`  ❌ Failed for article ${article.id}:`, err.message);
    }
  }

  console.log('--- SYNC COMPLETE ---');
}

syncChunks();
