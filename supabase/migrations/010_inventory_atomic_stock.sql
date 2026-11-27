-- Migration 010: atomic inventory stock changes
-- Run on a TEST/BACKUP database first. Run in Supabase SQL Editor.
--
-- Replaces the API's read -> compute -> write -> insert-log sequence with ONE
-- transaction that locks the item row, so concurrent requests cannot lose
-- updates and a log row can never exist without its matching stock change
-- (or vice versa).
--
-- Errors (RAISE EXCEPTION messages the API maps to HTTP codes):
--   'Inventory item not found'      -> 404
--   'Stock cannot go below zero'    -> 400
--   'Invalid quantity for action'   -> 400
--
-- NOTE: the existing triggers are untouched. The UPDATE below still fires
-- trg_inventory_updated_at and trg_inventory_low_stock (notify_low_stock), so
-- low-stock notification behaviour is unchanged.

CREATE OR REPLACE FUNCTION adjust_inventory_stock(
  p_item_id UUID,
  p_action  inventory_action,
  p_change  INT,
  p_notes   TEXT,
  p_user_id UUID
)
RETURNS inventory
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_before INT;
  v_after  INT;
  v_item   inventory;
BEGIN
  -- Defence in depth: same sign rules as the API schema
  IF (p_action = 'RESTOCK'    AND p_change <= 0)
  OR (p_action = 'USED'       AND p_change >= 0)
  OR (p_action = 'WRITE_OFF'  AND p_change >= 0)
  OR (p_action = 'ADJUSTMENT' AND p_change =  0) THEN
    RAISE EXCEPTION 'Invalid quantity for action';
  END IF;

  -- Lock the row for the duration of this transaction
  SELECT current_quantity INTO v_before
  FROM inventory
  WHERE id = p_item_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inventory item not found';
  END IF;

  v_after := v_before + p_change;
  IF v_after < 0 THEN
    RAISE EXCEPTION 'Stock cannot go below zero';
  END IF;

  UPDATE inventory
  SET current_quantity = v_after,
      updated_by       = p_user_id
  WHERE id = p_item_id
  RETURNING * INTO v_item;

  INSERT INTO inventory_logs
    (inventory_id, action, quantity_change, quantity_before, quantity_after, notes, performed_by)
  VALUES
    (p_item_id, p_action, p_change, v_before, v_after, p_notes, p_user_id);

  RETURN v_item;
END;
$$;

-- Only the API (service role) may call it. Browsers/anon must not.
REVOKE ALL ON FUNCTION adjust_inventory_stock(UUID, inventory_action, INT, TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION adjust_inventory_stock(UUID, inventory_action, INT, TEXT, UUID) TO service_role;

NOTIFY pgrst, 'reload schema';
