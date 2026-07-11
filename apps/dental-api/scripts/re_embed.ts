import 'dotenv/config';
import { supabase } from '../src/config/supabase';
import { generateEmbedding } from '../src/services/ai/embedding.service';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Fetching PENDING and PROCESSING chunks...');
  const { data: chunks, error } = await supabase
    .from('knowledge_base_chunks')
    .select('id, content')
    .in('embedding_status', ['PENDING', 'PROCESSING']);

  if (error) {
    console.error('Failed to fetch chunks:', error);
    process.exit(1);
  }

  console.log(`Found ${chunks?.length || 0} chunks to embed.`);

  if (chunks && chunks.length > 0) {
    for (const chunk of chunks) {
      try {
        console.log(`Embedding chunk ${chunk.id}...`);
        const vector = await generateEmbedding(chunk.content);

        await supabase
          .from('knowledge_base_chunks')
          .update({
            embedding: JSON.stringify(vector),
            embedding_status: 'DONE',
            updated_at: new Date().toISOString(),
          })
          .eq('id', chunk.id);

        console.log(`✅ Chunk ${chunk.id} embedded successfully.`);
      } catch (err: any) {
        console.error(`❌ Failed to embed chunk ${chunk.id}:`, err.message);
        await supabase
          .from('knowledge_base_chunks')
          .update({ embedding_status: 'FAILED' })
          .eq('id', chunk.id);
      }
      
      await sleep(500); // Rate limit
    }
  }

  console.log('Done!');
  process.exit(0);
}

run();
