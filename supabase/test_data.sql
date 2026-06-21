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

-- 5. Insert Demo Users (Drivers, Managers, and Corporate)
INSERT INTO public.users (id, name, email, phone, role, status)
VALUES
  ('demo-corporate-id', 'Voleak Logistics Corp', 'corporate@voleak.express', '+855 12 333 444', 'corporate', 'active'),
  ('demo-driver-id', 'Sok Sokha', 'driver@voleak.express', '+855 12 555 555', 'driver', 'active')
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Demo Schedule
INSERT INTO public.schedules (id, route_id, bus_id, driver_id, departure_time, arrival_time, days_of_week, price, status)
VALUES
  ('demo-schedule-id', 'r1-uuid-phnom-penh-siem-reap', '11111111-1111-1111-1111-111111111111', 'demo-driver-id', '08:00:00', '13:30:00', '1,2,3,4,5,6,7', 15.00, 'active')
ON CONFLICT (id) DO NOTHING;

-- 7. Insert Demo Trip (In Progress, so it can be tracked!)
INSERT INTO public.trips (id, schedule_id, trip_date, bus_id, driver_id, status, latitude, longitude)
VALUES
  ('demo-trip-id', 'demo-schedule-id', CURRENT_DATE, '11111111-1111-1111-1111-111111111111', 'demo-driver-id', 'in_progress', 11.9934, 104.9500)
ON CONFLICT (id) DO NOTHING;

-- 8. Insert Demo Goods (Cargo Shipments for Corporate User)
INSERT INTO public.goods (id, trip_id, sender_name, receiver_name, receiver_phone, description, weight_kg, status, corporate_id)
VALUES
  ('g1-uuid-electronics', 'demo-trip-id', 'Voleak Logistics Corp', 'Angkor Import Co.', '+855 88 123 456', 'Premium Electronics (ABA Terminals & Laptops)', 120.00, 'in_transit', 'demo-corporate-id'),
  ('g2-uuid-coffee', NULL, 'Voleak Logistics Corp', 'Brown Coffee Siem Reap', '+855 92 888 777', 'Gourmet Coffee Beans & Espresso Machines', 45.0, 'pending', 'demo-corporate-id'),
  ('g3-uuid-garments', 'demo-trip-id', 'Voleak Logistics Corp', 'Sihanoukville Port Hub', '+855 16 222 333', 'Export Garments & Textile Bags', 850.5, 'delivered', 'demo-corporate-id')
ON CONFLICT (id) DO NOTHING;

