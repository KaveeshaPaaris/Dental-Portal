-- ============================================================
-- DENTAL CLINIC PLATFORM — Migration 005
-- Add is_featured column to reviews table
-- Run this in your Supabase SQL Editor
-- ============================================================

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;

-- Only ACCEPTED reviews should be featurable, add a check constraint
ALTER TABLE reviews ADD CONSTRAINT chk_featured_only_accepted
  CHECK (is_featured = FALSE OR status = 'ACCEPTED');
