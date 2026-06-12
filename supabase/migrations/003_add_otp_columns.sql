-- Add OTP columns to bookings table for custom OTP flow
-- Run this in Supabase Dashboard → SQL Editor

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS otp_code       TEXT,
  ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ;
