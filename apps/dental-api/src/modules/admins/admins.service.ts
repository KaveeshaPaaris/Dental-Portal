import { supabase } from '../../config/supabase';
import { createError } from '../../middleware/error.middleware';

export async function getAllAdmins() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, is_active, created_at')
    .order('created_at', { ascending: false });
  if (error) throw createError('Failed to fetch admins', 500);
  return data;
}

export async function createAdmin(input: {
  full_name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}, createdBy: string) {
  // Create auth user via Supabase Admin API
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });

  if (authError || !authUser.user) {
    throw createError(authError?.message || 'Failed to create auth user', 500);
  }

  // Create profile row
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authUser.user.id,
      full_name: input.full_name,
      email: input.email,
      role: input.role,
      created_by: createdBy,
    })
    .select()
    .single();

  if (profileError || !profile) {
    // Rollback: delete the auth user if profile creation fails
    await supabase.auth.admin.deleteUser(authUser.user.id);
    throw createError('Failed to create admin profile', 500);
  }

  return profile;
}

export async function deactivateAdmin(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single();
  if (error || !data) throw createError('Failed to deactivate admin', 500);
  return data;
}

export async function deleteAdmin(id: string) {
  const { error: authError } = await supabase.auth.admin.deleteUser(id);
  if (authError) throw createError('Failed to delete auth user', 500);
  // Profile cascades via ON DELETE CASCADE
  return { message: 'Admin deleted.' };
}

export async function getCurrentAdmin(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, is_active, created_at')
    .eq('id', id)
    .single();
  if (error || !data) throw createError('Profile not found', 404);
  return data;
}
