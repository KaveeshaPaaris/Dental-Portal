-- ============================================================
-- DENTAL CLINIC PLATFORM — Full Combined Schema
-- Run this in your Supabase SQL Editor to initialize the DB
-- ============================================================

-- ─── CLEANUP (Allows re-running the script) ───────────────────
DROP TABLE IF EXISTS site_content CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS inventory_logs CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS blogs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP TYPE IF EXISTS booking_source CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS session_preference CASCADE;
DROP TYPE IF EXISTS review_status CASCADE;
DROP TYPE IF EXISTS inventory_action CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;

-- ─── ENUMS ──────────────────────────────────────────────────
CREATE TYPE booking_source      AS ENUM ('ONLINE', 'PHONE', 'WHATSAPP');
CREATE TYPE booking_status      AS ENUM ('PENDING_OTP', 'PENDING_REVIEW', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED');
CREATE TYPE session_preference  AS ENUM ('MORNING', 'EVENING');
CREATE TYPE review_status       AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');
CREATE TYPE inventory_action    AS ENUM ('RESTOCK', 'USED', 'ADJUSTMENT', 'WRITE_OFF');
CREATE TYPE notification_type   AS ENUM ('LOW_STOCK', 'NEW_BOOKING', 'NEW_REVIEW', 'SYSTEM');

-- ─── PROFILES ───────────────────────────────────────────────
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT        NOT NULL,
  email       TEXT        NOT NULL UNIQUE,
  role        TEXT        NOT NULL CHECK (role IN ('ADMIN', 'SUPER_ADMIN')),
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_by  UUID        REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── BOOKINGS ───────────────────────────────────────────────
CREATE TABLE bookings (
  id                   UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name         TEXT              NOT NULL,
  patient_email        TEXT,
  patient_phone        TEXT              NOT NULL,
  preferred_date       DATE              NOT NULL,
  preferred_session    session_preference NOT NULL,
  source               booking_source    NOT NULL DEFAULT 'ONLINE',
  status               booking_status    NOT NULL DEFAULT 'PENDING_OTP',

  assigned_date        DATE,
  assigned_session     session_preference,
  appointment_number   INT,
  slot_order           INT,

  otp_verified         BOOLEAN           DEFAULT FALSE,
  otp_code             TEXT,
  otp_expires_at       TIMESTAMPTZ,

  notes                TEXT,
  handled_by           UUID              REFERENCES profiles(id),

  review_token         TEXT              UNIQUE,
  review_token_sent_at TIMESTAMPTZ,

  deleted_at           TIMESTAMPTZ,

  created_at           TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

-- ─── REVIEWS ────────────────────────────────────────────────
CREATE TABLE reviews (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id   UUID          NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  patient_name TEXT          NOT NULL,
  content      TEXT          NOT NULL,
  rating       INT           CHECK (rating BETWEEN 1 AND 5),
  status       review_status NOT NULL DEFAULT 'PENDING',
  is_featured  BOOLEAN       NOT NULL DEFAULT FALSE,
  reviewed_by  UUID          REFERENCES profiles(id),
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_featured_only_accepted CHECK (is_featured = FALSE OR status = 'ACCEPTED')
);

-- ─── INVENTORY ──────────────────────────────────────────────
CREATE TABLE inventory (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT        NOT NULL,
  description       TEXT,
  unit              TEXT        NOT NULL DEFAULT 'pcs',
  current_quantity  INT         NOT NULL DEFAULT 0,
  minimum_threshold INT         NOT NULL DEFAULT 10,
  is_low_stock      BOOLEAN GENERATED ALWAYS AS (current_quantity <= minimum_threshold) STORED,
  created_by        UUID        REFERENCES profiles(id),
  updated_by        UUID        REFERENCES profiles(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INVENTORY LOGS ─────────────────────────────────────────
CREATE TABLE inventory_logs (
  id              UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id    UUID             NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  action          inventory_action NOT NULL,
  quantity_change INT              NOT NULL,
  quantity_before INT              NOT NULL,
  quantity_after  INT              NOT NULL,
  notes           TEXT,
  performed_by    UUID             REFERENCES profiles(id),
  created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

-- ─── FAQS ───────────────────────────────────────────────────
CREATE TABLE faqs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question   TEXT        NOT NULL,
  answer     TEXT        NOT NULL,
  keywords   TEXT[]      DEFAULT '{}',
  is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── NOTIFICATIONS ──────────────────────────────────────────
CREATE TABLE notifications (
  id          UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  type        notification_type NOT NULL,
  title       TEXT              NOT NULL,
  message     TEXT              NOT NULL,
  metadata    JSONB             DEFAULT '{}',
  target_role TEXT              CHECK (target_role IN ('ADMIN', 'SUPER_ADMIN', 'ALL')),
  is_read     BOOLEAN           NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

-- ─── SITE CONTENT (CMS) ─────────────────────────────────────
CREATE TABLE site_content (
  key        TEXT        PRIMARY KEY,
  value      JSONB       NOT NULL,
  label      TEXT,
  updated_by UUID        REFERENCES profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── BLOGS ──────────────────────────────────────────────────
CREATE TABLE blogs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT        NOT NULL,
  slug          TEXT        NOT NULL UNIQUE,
  excerpt       TEXT        NOT NULL,
  content       TEXT        NOT NULL,
  category      TEXT        NOT NULL DEFAULT 'General',
  cover_image   TEXT,
  is_published  BOOLEAN     NOT NULL DEFAULT FALSE,
  author_id     UUID        REFERENCES profiles(id),
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_faqs_updated_at BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_blogs_updated_at BEFORE UPDATE ON blogs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create notification when stock drops below threshold
CREATE OR REPLACE FUNCTION notify_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_low_stock = TRUE AND OLD.is_low_stock = FALSE THEN
    INSERT INTO notifications (type, title, message, metadata, target_role)
    VALUES (
      'LOW_STOCK',
      'Low Stock Alert',
      'Item "' || NEW.name || '" has dropped below its minimum threshold (' || NEW.minimum_threshold || ' ' || NEW.unit || ').',
      jsonb_build_object('inventory_id', NEW.id, 'item_name', NEW.name, 'current_quantity', NEW.current_quantity),
      'ALL'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_inventory_low_stock
  AFTER UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION notify_low_stock();

-- Auto-create notification when a new booking enters PENDING_REVIEW
CREATE OR REPLACE FUNCTION notify_new_booking()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'PENDING_REVIEW' AND (OLD.status IS NULL OR OLD.status = 'PENDING_OTP') THEN
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

CREATE TRIGGER trg_booking_new_pending
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION notify_new_booking();

-- Auto-create notification when a new review is submitted
CREATE OR REPLACE FUNCTION notify_new_review()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO notifications (type, title, message, metadata, target_role)
    VALUES (
      'NEW_REVIEW',
      'New Review Submitted',
      NEW.patient_name || ' has submitted a review that requires moderation.',
      jsonb_build_object('review_id', NEW.id, 'booking_id', NEW.booking_id),
      'ALL'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_review_submitted
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION notify_new_review();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory     ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content  ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs         ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public: read accepted reviews" ON reviews FOR SELECT USING (status = 'ACCEPTED');
CREATE POLICY "Public: read active FAQs" ON faqs FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public: read site content" ON site_content FOR SELECT USING (TRUE);
CREATE POLICY "Public: read published blogs" ON blogs FOR SELECT USING (is_published = TRUE);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO site_content (key, value, label) VALUES
  ('clinic_name',       '"Smile Dental Clinic"',         'Clinic Name'),
  ('clinic_tagline',    '"Your smile is our priority"',  'Tagline'),
  ('clinic_phone',      '"+1 (555) 000-0000"',           'Phone Number'),
  ('clinic_whatsapp',   '"+15550000000"',                 'WhatsApp Number'),
  ('clinic_email',      '"hello@smileclinic.com"',        'Contact Email'),
  ('clinic_address',    '"123 Main Street, City, Country"', 'Address'),
  ('clinic_map_embed',  '""',                             'Google Maps Embed URL'),
  ('clinic_hours',      '{"morning": "9:00 AM - 1:00 PM", "evening": "5:00 PM - 9:00 PM"}', 'Clinic Hours'),
  ('hero_headline',     '"World-Class Dental Care, Close to Home"', 'Hero Headline'),
  ('hero_subtext',      '"Book your appointment today and experience the difference."', 'Hero Subtext'),
  ('about_text',        '"We are a modern dental clinic dedicated to providing exceptional care..."', 'About Us Text'),
  ('doctors',           '[]', 'Doctors List (JSON Array)');

INSERT INTO faqs (question, answer, keywords) VALUES
  ('What are your clinic hours?', 'We are open in the morning from 9:00 AM to 1:00 PM, and in the evening from 5:00 PM to 9:00 PM.', ARRAY['hours', 'open', 'time', 'schedule', 'when']),
  ('How do I book an appointment?', 'You can book an appointment online by clicking the "Book an Appointment" button, or by calling/WhatsApp-ing us directly.', ARRAY['book', 'appointment', 'schedule', 'reserve']),
  ('Do you accept walk-ins?', 'We recommend booking in advance, but walk-ins are welcome subject to availability.', ARRAY['walk-in', 'walkin', 'without appointment']),
  ('What payment methods do you accept?', 'We accept cash, credit/debit cards, and most insurance plans. Please contact us for details.', ARRAY['payment', 'pay', 'cash', 'card', 'insurance']),
  ('Is there parking available?', 'Yes, free parking is available for all patients directly outside the clinic.', ARRAY['parking', 'park', 'car']),
  ('How do I cancel or reschedule my appointment?', 'Please call or WhatsApp us at least 24 hours in advance to cancel or reschedule.', ARRAY['cancel', 'reschedule', 'change', 'appointment']);
