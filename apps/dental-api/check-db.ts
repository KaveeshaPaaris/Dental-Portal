import { supabase } from './src/config/supabase';

async function checkDB() {
  console.log('--- DB CHECK ---');
  
  // 1. Check Articles
  const { data: articles, error: err1 } = await supabase.from('knowledge_base').select('id, title, status');
  if (err1) {
    console.error('Error fetching articles:', err1);
  } else {
    console.log(`Found ${articles?.length || 0} articles:`, articles);
  }

  // 2. Check Chunks
  const { data: chunks, error: err2 } = await supabase.from('knowledge_base_chunks').select('id, embedding_status');
  if (err2) {
    console.error('Error fetching chunks:', err2);
  } else {
    console.log(`Found ${chunks?.length || 0} chunks.`);
    if (chunks) {
      const pending = chunks.filter(c => c.embedding_status === 'PENDING').length;
      const done = chunks.filter(c => c.embedding_status === 'DONE').length;
      const failed = chunks.filter(c => c.embedding_status === 'FAILED').length;
      console.log(`Status -> PENDING: ${pending}, DONE: ${done}, FAILED: ${failed}`);
    }
  }
}
checkDB();
