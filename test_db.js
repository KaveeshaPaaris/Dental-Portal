global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/dental-api/.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.from('services').select('*').limit(1);
  console.log('Services table check:', error ? error.message : data);
  const { data: cData, error: cError } = await supabase.from('site_content').select('*').eq('key', 'services').limit(1);
  console.log('site_content services key:', cError ? cError.message : cData);
  const { data: kbData } = await supabase.from('knowledge_base').select('category').limit(5);
  console.log('KB categories:', kbData);
}
run();
