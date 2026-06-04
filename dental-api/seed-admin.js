const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const WebSocket = require('ws');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    realtime: {
      transport: WebSocket
    }
  }
);

async function seedAdmin() {
  const email = 'superadmin@smileclinic.com';
  const password = 'SuperSecretPassword123!';
  const fullName = 'System Administrator';

  console.log(`Checking if ${email} exists...`);
  
  // 1. Create User in Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true
  });

  if (authError) {
    if (authError.message.includes('already exists') || authError.message.includes('Email exists') || authError.message.includes('already been registered')) {
      console.log('User already exists in Supabase Auth. Proceeding to create profile...');
    } else {
      console.error('Error creating user in Auth:', authError.message);
      return;
    }
  }

  // Get user ID
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    console.error('Error listing users:', usersError.message);
    return;
  }
  
  const user = usersData.users.find(u => u.email === email);
  if (!user) {
    console.error('User not found after creation.');
    return;
  }

  // 2. Insert into profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      full_name: fullName,
      email: email,
      role: 'SUPER_ADMIN',
      is_active: true
    });

  if (profileError) {
    console.error('Error creating admin profile (Did you run the SQL migration?):', profileError.message);
  } else {
    console.log('\n✅ SUPER ADMIN CREATED SUCCESSFULLY!');
    console.log('Email:', email);
    console.log('Password:', password);
  }
}

seedAdmin();
