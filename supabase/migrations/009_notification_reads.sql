-- Migration 009: per-user notification read state + stop notifying on staff-created bookings
-- Run in Supabase Dashboard → SQL Editor.

-- 1. Per-user read state (API / service role only — RLS on, no policies)
CREATE TABLE IF NOT EXISTS notification_reads (
  notification_id UUID        NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL REFERENCES profiles(id)      ON DELETE CASCADE,
  read_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (notification_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_reads_user_id ON notification_reads(user_id);

ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

-- 2. Only notify for patient self-bookings.
--    Staff-created bookings (adminCreateBooking) are inserted with source = PHONE/WHATSAPP
--    and handled_by = <admin id>. We require source = 'ONLINE' AND handled_by IS NULL.
CREATE OR REPLACE FUNCTION notify_new_booking()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'PENDING_REVIEW'
     AND (OLD.status IS NULL OR OLD.status = 'PENDING_OTP')
     AND NEW.source = 'ONLINE'
     AND NEW.handled_by IS NULL THEN
    INSERT INTO notifications (type, title, message, metadata, target_role)
    VALUES (
      'NEW_BOOKING',
      'New Booking Request',
      NEW.patient_name || ' has submitted a booking request for ' || NEW.preferred_date || ' (' || NEW.preferred_session || ').',
      jsonb_build_object('booking_id', NEW.id, 'patient_name', NEW.patient_name),
      'ALL'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Make the new table visible to the API immediately
NOTIFY pgrst, 'reload schema';
