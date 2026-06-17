-- Migration 004: Add deleted_at to bookings for Recycle Bin feature
ALTER TABLE bookings ADD COLUMN deleted_at TIMESTAMPTZ;
