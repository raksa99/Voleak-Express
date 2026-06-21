-- ============================================================
-- Voleak Express Database Schema Setup
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. OPERATORS
CREATE TABLE IF NOT EXISTS public.operators (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  contact     TEXT,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  logo_url    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. USERS
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY, -- References auth.users(id)
  name          TEXT NOT NULL,
  email         TEXT UNIQUE,
  phone         TEXT,
  role          TEXT NOT NULL DEFAULT 'passenger' CHECK (role IN ('passenger', 'driver', 'conductor', 'manager', 'admin')),
  operator_id   UUID REFERENCES public.operators(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  age           INT,
  nationality   TEXT,
  card_id_url   TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 3. BUSES (Trucks)
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

-- 4. ROUTES
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

-- 5. STOPS
CREATE TABLE IF NOT EXISTS public.stops (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id    UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  sequence    INT NOT NULL,
  latitude    NUMERIC NOT NULL,
  longitude   NUMERIC NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 6. SCHEDULES
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

-- 7. TRIPS
CREATE TABLE IF NOT EXISTS public.trips (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id   UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  trip_date     DATE NOT NULL,
  bus_id        UUID REFERENCES public.buses(id) ON DELETE SET NULL,
  driver_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  latitude      NUMERIC,
  longitude     NUMERIC,
  departed_at   TIMESTAMPTZ,
  arrived_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 8. BOOKINGS
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

-- 9. TICKETS
CREATE TABLE IF NOT EXISTS public.tickets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  qr_code     TEXT UNIQUE NOT NULL,
  status      TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'cancelled', 'expired')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 10. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount          NUMERIC NOT NULL,
  payment_method  TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'aba', 'card')),
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 11. INCIDENTS
CREATE TABLE IF NOT EXISTS public.incidents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id      UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('delay', 'breakdown', 'accident', 'other')),
  description  TEXT NOT NULL,
  latitude     NUMERIC,
  longitude    NUMERIC,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- AUTOMATED USER SYNCHRONIZATION TRIGGER (auth.users -> public.users)
-- ============================================================
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
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
