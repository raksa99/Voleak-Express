-- ============================================================
-- Voleak Express Test Data Seed Script
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- after executing the schema.sql script.
-- ============================================================

-- 1. Insert Demo Operators
INSERT INTO public.operators (id, name, contact, status)
VALUES
  ('demo-operator-id', 'Voleak Express HQ', '+855 23 999 888', 'active'),
  ('063f25c7-df67-4bb2-bd24-9b2ee0688001', 'Capitol Express', '+855 23 123 456', 'active'),
  ('063f25c7-df67-4bb2-bd24-9b2ee0688002', 'Larry Express', '+855 12 888 777', 'active')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Demo Buses (Trucks)
INSERT INTO public.buses (id, operator_id, plate_number, model, capacity, status)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'demo-operator-id', 'PP-2A-8888', 'Hyundai Universe (Vip)', 40, 'active'),
  ('22222222-2222-2222-2222-222222222222', 'demo-operator-id', 'SR-3B-9999', 'Ford Transit', 15, 'active'),
  ('33333333-3333-3333-3333-333333333333', 'demo-operator-id', 'KP-1A-7777', 'Fuso Logistics', 10, 'maintenance')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Demo Routes
INSERT INTO public.routes (id, operator_id, name, origin, destination, distance_km, duration_min, status)
VALUES
  ('r1-uuid-phnom-penh-siem-reap', 'demo-operator-id', 'Phnom Penh ↔ Siem Reap', 'Phnom Penh', 'Siem Reap', 314, 330, 'active'),
  ('r2-uuid-phnom-penh-sihanoukville', 'demo-operator-id', 'Phnom Penh ↔ Sihanoukville', 'Phnom Penh', 'Sihanoukville', 230, 180, 'active'),
  ('r3-uuid-phnom-penh-battambang', 'demo-operator-id', 'Phnom Penh ↔ Battambang', 'Phnom Penh', 'Battambang', 290, 300, 'active')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Demo Stops
INSERT INTO public.stops (route_id, name, sequence, latitude, longitude)
VALUES
  ('r1-uuid-phnom-penh-siem-reap', 'Phnom Penh Terminal', 1, 11.5564, 104.9282),
  ('r1-uuid-phnom-penh-siem-reap', 'Kompong Thom Stop', 2, 12.7111, 104.9022),
  ('r1-uuid-phnom-penh-siem-reap', 'Siem Reap Terminal', 3, 13.3633, 103.8564)
ON CONFLICT (id) DO NOTHING;
