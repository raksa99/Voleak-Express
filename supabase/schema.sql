-- ============================================================
-- Voleak Express Consolidated Database Schema Setup
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TABLES SETUP
-- ============================================================

-- 1.1 OPERATORS
CREATE TABLE IF NOT EXISTS public.operators (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  contact     TEXT,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  logo_url    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 1.2 USERS
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY, -- References auth.users(id)
  name          TEXT NOT NULL,
  email         TEXT UNIQUE,
  phone         TEXT,
  role          TEXT NOT NULL DEFAULT 'passenger' CHECK (role IN ('passenger', 'driver', 'conductor', 'manager', 'admin', 'super_admin', 'corporate')),
  operator_id   UUID REFERENCES public.operators(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  age           INT,
  nationality   TEXT,
  card_id_url   TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 1.3 BUSES (Trucks)
CREATE TABLE IF NOT EXISTS public.buses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id   UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
  plate_number  TEXT NOT NULL,
  model         TEXT NOT NULL,
  capacity      INT NOT NULL, -- capacity in seats or tons
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired')),
  image_url     TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 1.4 ROUTES
CREATE TABLE IF NOT EXISTS public.routes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id   UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  origin        TEXT NOT NULL,
  destination   TEXT NOT NULL,
  distance_km   NUMERIC NOT NULL,
  duration_min  INT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 1.5 STOPS
CREATE TABLE IF NOT EXISTS public.stops (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id    UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  sequence    INT NOT NULL,
  latitude    NUMERIC NOT NULL,
  longitude   NUMERIC NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 1.6 SCHEDULES
CREATE TABLE IF NOT EXISTS public.schedules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id        UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  bus_id          UUID NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
  driver_id       UUID REFERENCES public.users(id) ON DELETE SET NULL,
  conductor_id    UUID REFERENCES public.users(id) ON DELETE SET NULL,
  departure_time  TIME NOT NULL,
  arrival_time    TIME NOT NULL,
  days_of_week    TEXT NOT NULL, -- e.g., "1,2,3,4,5,6,7"
  price           NUMERIC NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 1.7 TRIPS
CREATE TABLE IF NOT EXISTS public.trips (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id             UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  trip_date               DATE NOT NULL,
  bus_id                  UUID REFERENCES public.buses(id) ON DELETE SET NULL,
  driver_id               UUID REFERENCES public.users(id) ON DELETE SET NULL,
  conductor_id            UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status                  TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  latitude                NUMERIC,
  longitude               NUMERIC,
  departed_at             TIMESTAMPTZ,
  arrived_at              TIMESTAMPTZ,
  conductor_allowed_start BOOLEAN DEFAULT false,
  created_at              TIMESTAMPTZ DEFAULT now()
);

-- 1.8 BOOKINGS
CREATE TABLE IF NOT EXISTS public.bookings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id               UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  passenger_id          UUID REFERENCES public.users(id) ON DELETE SET NULL,
  seat_number           TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'boarded', 'cancelled')),
  total_price           NUMERIC NOT NULL,
  booked_at             TIMESTAMPTZ DEFAULT now(),
  booking_channel       TEXT NOT NULL DEFAULT 'online' CHECK (booking_channel IN ('online', 'counter', 'conductor')),
  passenger_name        TEXT,
  passenger_age         INT,
  passenger_phone       TEXT,
  passenger_nationality TEXT,
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- 1.9 TICKETS
CREATE TABLE IF NOT EXISTS public.tickets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  qr_code     TEXT UNIQUE NOT NULL,
  status      TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'cancelled', 'expired')),
  scanned_at  TIMESTAMPTZ,
  scanned_by  UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 1.10 PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount          NUMERIC NOT NULL,
  payment_method  TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'aba', 'card')),
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'paid')),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 1.11 INCIDENTS
CREATE TABLE IF NOT EXISTS public.incidents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id      UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  reported_by  UUID REFERENCES public.users(id) ON DELETE SET NULL,
  type         TEXT NOT NULL CHECK (type IN ('delay', 'breakdown', 'accident', 'other')),
  description  TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- 1.12 OTP CODES
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  code        TEXT NOT NULL,
  password    TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '5 minutes'),
  used        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_email_code ON public.otp_codes(email, code);

-- 1.13 PROMOTIONS
CREATE TABLE IF NOT EXISTS public.promotions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT UNIQUE NOT NULL,
  discount_type   TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value  NUMERIC NOT NULL,
  min_purchase    NUMERIC,
  max_usage       INT,
  max_per_user    INT,
  used_count      INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 1.14 PROMOTION USAGES
CREATE TABLE IF NOT EXISTS public.promotion_usages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id    UUID NOT NULL REFERENCES public.promotions(id),
  user_id         UUID NOT NULL REFERENCES public.users(id),
  used_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promotion_usages_promo_user ON public.promotion_usages(promotion_id, user_id);

-- 1.15 NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'general',
  reference_type  TEXT,
  reference_id    TEXT,
  is_read         BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- 1.16 GOODS (Cargo)
CREATE TABLE IF NOT EXISTS public.goods (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id        UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  sender_name    TEXT NOT NULL,
  receiver_name  TEXT NOT NULL,
  receiver_phone TEXT NOT NULL,
  description    TEXT NOT NULL,
  weight_kg      NUMERIC NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'loaded', 'in_transit', 'delivered', 'cancelled')),
  corporate_id   UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ DEFAULT now()
);




-- ============================================================
-- 2. HELPER FUNCTIONS & TRIGGERS
-- ============================================================

-- 2.1 HELPER: Check if current user is super_admin (Security Definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

-- 2.2 TRIGGER FUNCTION: Synchronize auth.users -> public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, phone, role, status)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', 'User'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    'passenger',
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create User Synchronization Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2.3 TRIGGER FUNCTION: Auto-create Tickets & Payments upon Booking Creation
CREATE OR REPLACE FUNCTION public.handle_new_booking()
RETURNS trigger AS $$
BEGIN
  -- 1. Insert ticket
  INSERT INTO public.tickets (booking_id, qr_code, status)
  VALUES (
    new.id,
    'TICK-' || UPPER(substring(md5(random()::text) from 1 for 8)),
    'valid'
  );

  -- 2. Insert payment
  INSERT INTO public.payments (booking_id, amount, payment_method, status)
  VALUES (
    new.id,
    new.total_price,
    'aba',
    'paid'
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Booking Trigger
DROP TRIGGER IF EXISTS on_booking_created ON public.bookings;
CREATE TRIGGER on_booking_created
  AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_booking();


-- ============================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods ENABLE ROW LEVEL SECURITY;

-- 3.1 OPERATORS POLICIES
DROP POLICY IF EXISTS "Anyone can view operators" ON public.operators;
CREATE POLICY "Anyone can view operators" ON public.operators FOR SELECT USING (true);

DROP POLICY IF EXISTS "Super admin can manage operators" ON public.operators;
CREATE POLICY "Super admin can manage operators" ON public.operators FOR ALL
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- 3.2 USERS POLICIES
DROP POLICY IF EXISTS "Anyone can view users" ON public.users;
CREATE POLICY "Anyone can view users" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Super admin can manage users" ON public.users;
CREATE POLICY "Super admin can manage users" ON public.users FOR ALL
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- 3.3 BUSES POLICIES
DROP POLICY IF EXISTS "Anyone can view buses" ON public.buses;
CREATE POLICY "Anyone can view buses" ON public.buses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff and admin can manage buses" ON public.buses;
CREATE POLICY "Staff and admin can manage buses" ON public.buses FOR ALL
  USING (public.is_super_admin() OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('manager', 'admin')))
  WITH CHECK (public.is_super_admin() OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('manager', 'admin')));

-- 3.4 ROUTES POLICIES
DROP POLICY IF EXISTS "Anyone can view routes" ON public.routes;
CREATE POLICY "Anyone can view routes" ON public.routes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff and admin can manage routes" ON public.routes;
CREATE POLICY "Staff and admin can manage routes" ON public.routes FOR ALL
  USING (public.is_super_admin() OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('manager', 'admin')))
  WITH CHECK (public.is_super_admin() OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('manager', 'admin')));

-- 3.5 STOPS POLICIES
DROP POLICY IF EXISTS "Anyone can view stops" ON public.stops;
CREATE POLICY "Anyone can view stops" ON public.stops FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff and admin can manage stops" ON public.stops;
CREATE POLICY "Staff and admin can manage stops" ON public.stops FOR ALL
  USING (public.is_super_admin() OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('manager', 'admin')))
  WITH CHECK (public.is_super_admin() OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('manager', 'admin')));

-- 3.6 SCHEDULES POLICIES
DROP POLICY IF EXISTS "Anyone can view schedules" ON public.schedules;
CREATE POLICY "Anyone can view schedules" ON public.schedules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff and admin can manage schedules" ON public.schedules;
CREATE POLICY "Staff and admin can manage schedules" ON public.schedules FOR ALL
  USING (public.is_super_admin() OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('manager', 'admin')))
  WITH CHECK (public.is_super_admin() OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('manager', 'admin')));

-- 3.7 TRIPS POLICIES
DROP POLICY IF EXISTS "Anyone can view trips" ON public.trips;
CREATE POLICY "Anyone can view trips" ON public.trips FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert trips" ON public.trips;
CREATE POLICY "Authenticated users can insert trips" ON public.trips FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update trips" ON public.trips;
CREATE POLICY "Authenticated users can update trips" ON public.trips FOR UPDATE
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 3.8 BOOKINGS POLICIES
DROP POLICY IF EXISTS "Anyone can view bookings" ON public.bookings;
CREATE POLICY "Anyone can view bookings" ON public.bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own bookings" ON public.bookings;
CREATE POLICY "Users can insert their own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = passenger_id);

DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
CREATE POLICY "Users can update their own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = passenger_id);

-- 3.9 TICKETS POLICIES
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.tickets;
CREATE POLICY "Users can view their own tickets" ON public.tickets FOR SELECT
  USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = tickets.booking_id AND bookings.passenger_id = auth.uid()));

DROP POLICY IF EXISTS "Staff and admin can view all tickets" ON public.tickets;
CREATE POLICY "Staff and admin can view all tickets" ON public.tickets FOR SELECT
  USING (public.is_super_admin() OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('driver', 'conductor', 'manager', 'admin')));

DROP POLICY IF EXISTS "Staff and admin can update tickets" ON public.tickets;
CREATE POLICY "Staff and admin can update tickets" ON public.tickets FOR UPDATE
  USING (public.is_super_admin() OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('driver', 'conductor', 'manager', 'admin')));

-- 3.10 PAYMENTS POLICIES
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT
  USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = payments.booking_id AND bookings.passenger_id = auth.uid()));

DROP POLICY IF EXISTS "Staff and admin can view all payments" ON public.payments;
CREATE POLICY "Staff and admin can view all payments" ON public.payments FOR SELECT
  USING (public.is_super_admin() OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('manager', 'admin')));

DROP POLICY IF EXISTS "Staff and admin can update payments" ON public.payments;
CREATE POLICY "Staff and admin can update payments" ON public.payments FOR UPDATE
  USING (public.is_super_admin() OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('manager', 'admin')));

-- 3.11 INCIDENTS POLICIES
DROP POLICY IF EXISTS "Anyone can view incidents" ON public.incidents;
CREATE POLICY "Anyone can view incidents" ON public.incidents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can report incidents" ON public.incidents;
CREATE POLICY "Authenticated users can report incidents" ON public.incidents FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3.12 OTP CODES POLICIES
DROP POLICY IF EXISTS "Anyone can check/manage OTP" ON public.otp_codes;
CREATE POLICY "Anyone can check/manage OTP" ON public.otp_codes FOR ALL USING (true) WITH CHECK (true);

-- 3.13 PROMOTIONS POLICIES
DROP POLICY IF EXISTS "Anyone can read promotions" ON public.promotions;
CREATE POLICY "Anyone can read promotions" ON public.promotions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can update promotions" ON public.promotions;
CREATE POLICY "Authenticated users can update promotions" ON public.promotions FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Super admin can manage promotions" ON public.promotions;
CREATE POLICY "Super admin can manage promotions" ON public.promotions FOR ALL
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- 3.14 PROMOTION USAGES POLICIES
DROP POLICY IF EXISTS "Users can insert their own usage" ON public.promotion_usages;
CREATE POLICY "Users can insert their own usage" ON public.promotion_usages FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read their own usage" ON public.promotion_usages;
CREATE POLICY "Users can read their own usage" ON public.promotion_usages FOR SELECT USING (auth.uid() = user_id);

-- 3.15 NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);


-- 3.16 GOODS POLICIES
DROP POLICY IF EXISTS "Users can view their own goods" ON public.goods;
CREATE POLICY "Users can view their own goods" ON public.goods FOR SELECT
  USING (auth.uid() = corporate_id);

DROP POLICY IF EXISTS "Staff and admin can view all goods" ON public.goods;
CREATE POLICY "Staff and admin can view all goods" ON public.goods FOR SELECT
  USING (public.is_super_admin() OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('manager', 'admin')));

DROP POLICY IF EXISTS "Staff and admin can manage all goods" ON public.goods;
CREATE POLICY "Staff and admin can manage all goods" ON public.goods FOR ALL
  USING (public.is_super_admin() OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('manager', 'admin')))
  WITH CHECK (public.is_super_admin() OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('manager', 'admin')));


-- ============================================================
-- 4. STORAGE BUCKETS SETUP
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('operator-logos', 'operator-logos', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('staff-card-ids', 'staff-card-ids', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('truck-images', 'truck-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 4.1 Policies for operator-logos bucket
DROP POLICY IF EXISTS "Allow authenticated uploads operator-logos" ON storage.objects;
CREATE POLICY "Allow authenticated uploads operator-logos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'operator-logos');

DROP POLICY IF EXISTS "Allow public reads operator-logos" ON storage.objects;
CREATE POLICY "Allow public reads operator-logos"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'operator-logos');

-- 4.2 Policies for staff-card-ids bucket
DROP POLICY IF EXISTS "Allow authenticated uploads staff-card-ids" ON storage.objects;
CREATE POLICY "Allow authenticated uploads staff-card-ids"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'staff-card-ids');

DROP POLICY IF EXISTS "Allow public reads staff-card-ids" ON storage.objects;
CREATE POLICY "Allow public reads staff-card-ids"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'staff-card-ids');

-- 4.3 Policies for truck-images bucket
DROP POLICY IF EXISTS "Allow authenticated uploads truck-images" ON storage.objects;
CREATE POLICY "Allow authenticated uploads truck-images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'truck-images');

DROP POLICY IF EXISTS "Allow public reads truck-images" ON storage.objects;
CREATE POLICY "Allow public reads truck-images"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'truck-images');


-- ============================================================
-- 5. REALTIME SYSTEM SETUP
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'trips'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE trips;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'bookings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
  END IF;
END $$;
