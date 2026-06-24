-- ============================================================
-- DENTAL CLINIC PLATFORM — Dummy Data
-- Run this in your Supabase SQL Editor to insert test data
-- ============================================================

-- Insert Dummy Bookings
INSERT INTO bookings (id, patient_name, patient_email, patient_phone, preferred_date, preferred_session, source, status, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'John Doe', 'john@example.com', '1234567890', CURRENT_DATE - INTERVAL '10 days', 'MORNING', 'ONLINE', 'COMPLETED', NOW() - INTERVAL '10 days'),
  ('22222222-2222-2222-2222-222222222222', 'Jane Smith', 'jane@example.com', '0987654321', CURRENT_DATE - INTERVAL '8 days', 'EVENING', 'PHONE', 'COMPLETED', NOW() - INTERVAL '8 days'),
  ('33333333-3333-3333-3333-333333333333', 'Alice Johnson', 'alice@example.com', '5555555555', CURRENT_DATE - INTERVAL '6 days', 'MORNING', 'WHATSAPP', 'COMPLETED', NOW() - INTERVAL '6 days'),
  ('44444444-4444-4444-4444-444444444444', 'Bob Brown', 'bob@example.com', '1112223333', CURRENT_DATE - INTERVAL '4 days', 'EVENING', 'ONLINE', 'COMPLETED', NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

-- Insert Dummy Reviews
INSERT INTO reviews (booking_id, patient_name, content, rating, status, is_featured, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'John Doe', 'Great service and very friendly staff. The clinic is clean and modern.', 5, 'ACCEPTED', TRUE, NOW() - INTERVAL '9 days'),
  ('22222222-2222-2222-2222-222222222222', 'Jane Smith', 'I had a painless root canal! The doctors are very skilled.', 5, 'ACCEPTED', TRUE, NOW() - INTERVAL '7 days'),
  ('33333333-3333-3333-3333-333333333333', 'Alice Johnson', 'Highly recommend this clinic. They took great care of my kids.', 4, 'ACCEPTED', TRUE, NOW() - INTERVAL '5 days'),
  ('44444444-4444-4444-4444-444444444444', 'Bob Brown', 'Good experience overall, though I had to wait a bit longer than my appointment time.', 4, 'PENDING', FALSE, NOW() - INTERVAL '3 days');
