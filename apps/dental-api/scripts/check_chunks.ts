import 'dotenv/config';
import { supabase } from '../src/config/supabase';

async function run() {
  const { data, error } = await supabase
    .from('knowledge_base_chunks')
    .select('id, embedding_status, article_id, content')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching chunks:', error);
  } else {
    console.log(`Total chunks: ${data?.length}`);
    const pending = data?.filter(c => c.embedding_status === 'PENDING').length;
    const done = data?.filter(c => c.embedding_status === 'DONE').length;
    const failed = data?.filter(c => c.embedding_status === 'FAILED').length;
    console.log(`PENDING: ${pending}`);
    console.log(`DONE: ${done}`);
    console.log(`FAILED: ${failed}`);
    
    // Check if there is any chunk about implants
    const implants = data?.filter(c => c.content?.toLowerCase().includes('implant'));
    console.log(`Chunks containing 'implant': ${implants?.length}`);
    if (implants && implants.length > 0) {
      console.log('Sample implant chunk status:', implants[0].embedding_status);
    }
  }
  process.exit(0);
}

run();
