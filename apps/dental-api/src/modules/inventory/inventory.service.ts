import { supabase } from '../../config/supabase';
import { createError } from '../../middleware/error.middleware';
import type { CreateItemInput, UpdateItemInput, StockChangeInput } from './inventory.schema';

export async function getAllItems() {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw createError('Failed to fetch inventory', 500);
  return data;
}

export async function createItem(input: CreateItemInput, adminId: string) {
  const { data, error } = await supabase
    .from('inventory')
    .insert({
      name: input.name,
      description: input.description ?? null,
      unit: input.unit,
      current_quantity: input.current_quantity,
      minimum_threshold: input.minimum_threshold,
      image_url: input.image_url ?? null,
      created_by: adminId,
      updated_by: adminId,
    })
    .select()
    .single();
  if (error || !data) throw createError('Failed to create inventory item', 500);
  return data;
}

export async function updateItem(id: string, input: UpdateItemInput, adminId: string) {
  const { data, error } = await supabase
    .from('inventory')
    .update({ ...input, updated_by: adminId })
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw createError('Failed to update inventory item', 500);
  if (!data) throw createError('Inventory item not found', 404);
  return data;
}

/**
 * Atomic stock change: the adjust_inventory_stock() Postgres function locks the row,
 * checks the result is >= 0, updates the quantity and writes the log in ONE transaction.
 */
export async function logStockChange(id: string, input: StockChangeInput, adminId: string) {
  const { data, error } = await supabase.rpc('adjust_inventory_stock', {
    p_item_id: id,
    p_action: input.action,
    p_change: input.quantity_change,
    p_notes: input.notes ?? null,
    p_user_id: adminId,
  });

  if (error) {
    const msg = error.message ?? '';
    if (msg.includes('Inventory item not found')) throw createError('Inventory item not found', 404);
    if (msg.includes('Stock cannot go below zero')) throw createError('Stock cannot go below zero', 400);
    if (msg.includes('Invalid quantity for action')) throw createError('Invalid quantity for this action', 400);
    console.error('[logStockChange] RPC error:', error);
    throw createError('Failed to update stock quantity', 500);
  }
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
