import { supabase } from '../../config/supabase';
import { createError } from '../../middleware/error.middleware';

export async function getAllItems() {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw createError('Failed to fetch inventory', 500);
  return data;
}

export async function createItem(input: {
  name: string;
  description?: string;
  unit?: string;
  current_quantity: number;
  minimum_threshold: number;
  image_url?: string;
}, adminId: string) {
  const { data, error } = await supabase
    .from('inventory')
    .insert({ ...input, created_by: adminId, updated_by: adminId })
    .select()
    .single();
  if (error || !data) throw createError('Failed to create inventory item', 500);
  return data;
}

export async function updateItem(id: string, input: Partial<{
  name: string;
  description: string;
  unit: string;
  minimum_threshold: number;
  image_url: string;
}>, adminId: string) {
  const { data, error } = await supabase
    .from('inventory')
    .update({ ...input, updated_by: adminId })
    .eq('id', id)
    .select()
    .single();
  if (error || !data) throw createError('Failed to update inventory item', 500);
  return data;
}

export async function logStockChange(id: string, input: {
  action: 'RESTOCK' | 'USED' | 'ADJUSTMENT' | 'WRITE_OFF';
  quantity_change: number;
  notes?: string;
}, adminId: string) {
  const { data: item } = await supabase.from('inventory').select('current_quantity').eq('id', id).single();
  if (!item) throw createError('Inventory item not found', 404);

  const before = item.current_quantity;
  const after = before + input.quantity_change;
  if (after < 0) throw createError('Stock cannot go below zero', 400);

  // Log the change
  await supabase.from('inventory_logs').insert({
    inventory_id: id,
    action: input.action,
    quantity_change: input.quantity_change,
    quantity_before: before,
    quantity_after: after,
    notes: input.notes ?? null,
    performed_by: adminId,
  });

  // Update current quantity (triggers low_stock computed column + trigger)
  const { data, error } = await supabase
    .from('inventory')
    .update({ current_quantity: after, updated_by: adminId })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) throw createError('Failed to update stock quantity', 500);
  return data;
}

export async function getItemLogs(id: string) {
  const { data, error } = await supabase
    .from('inventory_logs')
    .select('*, profiles(full_name)')
    .eq('inventory_id', id)
    .order('created_at', { ascending: false });
  if (error) throw createError('Failed to fetch logs', 500);
  return data;
}

export async function deleteItem(id: string) {
  const { error } = await supabase.from('inventory').delete().eq('id', id);
  if (error) throw createError('Failed to delete inventory item', 500);
  return { message: 'Item deleted.' };
}
