import 'dotenv/config';
import { supabase } from '../src/config/supabase';

async function run() {
  const { data, error } = await supabase.from('services').select('slug, title');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Slugs in DB:', data?.map(s => s.slug));
  }
  process.exit(0);
}
run();
