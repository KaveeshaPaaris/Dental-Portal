-- ============================================================
-- DENTAL CLINIC PLATFORM — Migration 006
-- Add is_hidden column to reviews table
-- Run this in your Supabase SQL Editor
-- ============================================================

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT FALSE;
