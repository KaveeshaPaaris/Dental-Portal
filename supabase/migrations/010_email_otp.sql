-- 010_email_otp.sql
-- Email OTP hardening. SAFE: only ADDS columns, deletes nothing.
-- Run once in the Supabase SQL editor.
--
-- otp_code now stores an HMAC hash of the code (never the plain code).

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS otp_attempts      INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS otp_resend_count  INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS otp_last_sent_at  TIMESTAMPTZ;

-- Speeds up the "max unverified bookings per email per day" check.
CREATE INDEX IF NOT EXISTS idx_bookings_email_created
  ON bookings (patient_email, created_at DESC);
