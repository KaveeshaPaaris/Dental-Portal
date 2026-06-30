-- ============================================================
-- Migration 007 — Add image_url to inventory table
-- Run this in your Supabase SQL Editor
-- ============================================================

ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS image_url TEXT;
