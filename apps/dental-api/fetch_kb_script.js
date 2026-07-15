require('dotenv').config();

async function run() {
  const res = await fetch(process.env.SUPABASE_URL + '/rest/v1/knowledge_base?select=title,content', {
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

run();
