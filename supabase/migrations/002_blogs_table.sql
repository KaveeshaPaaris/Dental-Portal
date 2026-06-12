-- ============================================================
-- DENTAL CLINIC PLATFORM — Blog Posts Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE TABLE blogs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT        NOT NULL,
  slug          TEXT        NOT NULL UNIQUE,
  excerpt       TEXT        NOT NULL,
  content       TEXT        NOT NULL,
  category      TEXT        NOT NULL DEFAULT 'General',
  cover_image   TEXT,                              -- URL to cover image
  is_published  BOOLEAN     NOT NULL DEFAULT FALSE,
  author_id     UUID        REFERENCES profiles(id),
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update timestamp
CREATE TRIGGER trg_blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public: read published blogs"
  ON blogs FOR SELECT USING (is_published = TRUE);
