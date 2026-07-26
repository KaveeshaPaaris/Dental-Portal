-- ============================================================
-- DENTAL CLINIC PLATFORM — Clinic Schedule Overrides
-- ============================================================

CREATE TABLE clinic_schedule_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  morning_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  evening_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  custom_session_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  custom_session_label TEXT,
  custom_session_start TIME,
  custom_session_end TIME,
  reason TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE clinic_schedule_overrides ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "Public: read schedule overrides"
  ON clinic_schedule_overrides FOR SELECT USING (TRUE);

-- Auto-update updated_at timestamp
CREATE TRIGGER trg_schedule_overrides_updated_at
  BEFORE UPDATE ON clinic_schedule_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
