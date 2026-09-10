-- =====================================================================
-- VOLEAK EXPRESS — FACTORY-TO-FACTORY B2B FREIGHT & CARGO LOGISTICS
-- Production PostgreSQL Database Migration for Supabase
-- =====================================================================

-- Enable essential extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 0. CLEANUP LEGACY OBJECTS (Safely drop prior tables)
-- ---------------------------------------------------------------------
drop table if exists public.tickets cascade;
drop table if exists public.promotions cascade;
drop table if exists public.buses cascade;

-- ---------------------------------------------------------------------
-- 1. FACTORY PARTNERS & LOGISTICS HUBS (Operators / Industrial Hubs)
-- ---------------------------------------------------------------------
create table if not exists public.operators (
    id text primary key default ('hub-' || substr(md5(random()::text), 1, 8)),
    name text not null, -- e.g. "Phnom Penh Special Economic Zone Logistics Hub"
    code text unique not null,
    contact text,
    contact_phone text,
    status text default 'active' check (status in ('active', 'inactive', 'suspended')),
    fleet_count integer default 0,
    rating numeric(3, 2) default 5.0,
    logo_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 2. USERS (Super Admins, Factory Logistics Managers, Truck Drivers, Dispatchers, Factory Clients)
-- ---------------------------------------------------------------------
create table if not exists public.users (
    id uuid primary key default gen_random_uuid(),
    auth_user_id uuid unique,
    name text,
    full_name text not null,
    email text unique,
    phone text,
    role text not null default 'corporate' check (
        role in ('super_admin', 'admin', 'manager', 'operator_admin', 'driver', 'conductor', 'corporate', 'passenger')
    ),
    status text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
    operator_id text references public.operators(id) on delete set null,
    factory_name text,
    age integer,
    nationality text default 'Cambodian',
    card_id_url text,
    avatar text,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 3. TRUCKS (Heavy Container Haulers, Flatbeds, Cold-Chain Trailers)
-- ---------------------------------------------------------------------
create table if not exists public.trucks (
    id text primary key default ('trk-v-' || substr(md5(random()::text), 1, 8)),
    operator_id text references public.operators(id) on delete set null,
    plate_number text unique not null,
    model text not null,
    capacity_tons numeric(6, 2) not null default 10.0,
    status text not null default 'active' check (status in ('active', 'maintenance', 'retired')),
    truck_type text not null default 'Container Heavy Trailer (25T)',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 4. ROUTES (Factory Freight Corridors & Industrial Highway Routes)
-- ---------------------------------------------------------------------
create table if not exists public.routes (
    id text primary key default ('corridor-' || substr(md5(random()::text), 1, 8)),
    operator_id text references public.operators(id) on delete set null,
    name text not null,
    origin text not null,
    destination text not null,
    distance_km numeric(8, 2) default 0,
    duration_hours numeric(5, 2) default 0,
    duration_min integer default 0,
    status text default 'active' check (status in ('active', 'inactive')),
    stops jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 5. SCHEDULES (Daily Factory Dispatch Manifests)
-- ---------------------------------------------------------------------
create table if not exists public.schedules (
    id text primary key default ('sch-' || substr(md5(random()::text), 1, 8)),
    route_id text not null references public.routes(id) on delete cascade,
    truck_id text references public.trucks(id) on delete set null,
    bus_id text references public.trucks(id) on delete set null,
    driver_id uuid references public.users(id) on delete set null,
    conductor_id uuid references public.users(id) on delete set null,
    departure_time text not null,
    arrival_time text not null,
    days_of_week text default 'Daily Express',
    price numeric(10, 2) default 0.00,
    base_price numeric(10, 2) default 0.00,
    status text default 'active' check (status in ('active', 'inactive', 'cancelled')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 6. TRIPS (Live Highway Freight Voyages & GPS Highway Telemetry)
-- ---------------------------------------------------------------------
create table if not exists public.trips (
    id text primary key default ('TRK-' || floor(random() * 900 + 100)::text),
    schedule_id text references public.schedules(id) on delete set null,
    route_id text references public.routes(id) on delete set null,
    route_name text,
    truck_plate text,
    bus_plate text,
    driver_name text,
    trip_date date default current_date not null,
    truck_id text references public.trucks(id) on delete set null,
    bus_id text references public.trucks(id) on delete set null,
    driver_id uuid references public.users(id) on delete set null,
    conductor_id uuid references public.users(id) on delete set null,
    status text not null default 'scheduled' check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
    departure_time text,
    departed_at timestamp with time zone,
    arrived_at timestamp with time zone,
    latitude double precision default 11.5564,
    longitude double precision default 104.9282,
    speed_kmh integer default 0,
    weight_loaded_percent integer default 0,
    cargo_temp_celsius integer default 24,
    next_stop text,
    conductor_allowed_start boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 7. BOOKINGS / WAYBILLS (B2B Factory Shipping Consignments)
-- ---------------------------------------------------------------------
create table if not exists public.bookings (
    id text primary key default ('WB-' || floor(random() * 9000 + 1000)::text),
    trip_id text references public.trips(id) on delete set null,
    passenger_id uuid references public.users(id) on delete set null,
    sender text not null,
    receiver text not null,
    passenger_name text,
    seat_number text,
    cargo_type text default 'General Industrial Freight',
    booking_channel text default 'Factory Contract Freight',
    status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'boarded', 'cancelled')),
    total_price numeric(10, 2) default 0.00,
    cod_amount numeric(10, 2) default 0.00,
    qr_code text unique not null,
    proof_photo_url text,
    signature_url text,
    booked_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 8. GOODS (Factory Cargo Manifest Items)
-- ---------------------------------------------------------------------
create table if not exists public.goods (
    id text primary key default ('cargo-' || substr(md5(random()::text), 1, 8)),
    trip_id text references public.trips(id) on delete set null,
    booking_id text references public.bookings(id) on delete cascade,
    sender_name text not null,
    receiver_name text not null,
    receiver_phone text not null,
    description text not null,
    weight_kg numeric(10, 2) not null default 100.0,
    weight_tons numeric(8, 3) default 0.1,
    status text not null default 'pending' check (status in ('pending', 'loaded', 'in_transit', 'delivered', 'cancelled')),
    corporate_id text,
    qr_code text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 9. INCIDENTS (Shipping Exceptions & Delay Logs)
-- ---------------------------------------------------------------------
create table if not exists public.incidents (
    id text primary key default ('inc-' || substr(md5(random()::text), 1, 8)),
    incident_type text not null,
    type text not null default 'breakdown' check (type in ('breakdown', 'delay', 'accident', 'other')),
    trip_id text,
    reported_by text not null,
    description text not null,
    timestamp text,
    status text not null default 'open' check (status in ('open', 'under_review', 'resolved')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 10. NOTIFICATIONS (Factory Dispatch & Arrival Alerts)
-- ---------------------------------------------------------------------
create table if not exists public.notifications (
    id text primary key default ('notif-' || substr(md5(random()::text), 1, 8)),
    user_id uuid references public.users(id) on delete cascade,
    title text not null,
    body text not null,
    type text default 'freight_alert',
    reference_type text,
    reference_id text,
    is_read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 11. REALTIME REPLICATION SETUP
-- ---------------------------------------------------------------------
do $$ begin
    alter publication supabase_realtime add table public.trips;
    alter publication supabase_realtime add table public.bookings;
    alter publication supabase_realtime add table public.goods;
    alter publication supabase_realtime add table public.incidents;
    alter publication supabase_realtime add table public.notifications;
exception
    when others then null;
end $$;

-- ---------------------------------------------------------------------
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------
alter table public.operators enable row level security;
alter table public.users enable row level security;
alter table public.trucks enable row level security;
alter table public.routes enable row level security;
alter table public.schedules enable row level security;
alter table public.trips enable row level security;
alter table public.bookings enable row level security;
alter table public.goods enable row level security;
alter table public.incidents enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "Allow all on operators" on public.operators;
create policy "Allow all on operators" on public.operators for all using (true) with check (true);

drop policy if exists "Allow all on users" on public.users;
create policy "Allow all on users" on public.users for all using (true) with check (true);

drop policy if exists "Allow all on trucks" on public.trucks;
create policy "Allow all on trucks" on public.trucks for all using (true) with check (true);

drop policy if exists "Allow all on routes" on public.routes;
create policy "Allow all on routes" on public.routes for all using (true) with check (true);

drop policy if exists "Allow all on schedules" on public.schedules;
create policy "Allow all on schedules" on public.schedules for all using (true) with check (true);

drop policy if exists "Allow all on trips" on public.trips;
create policy "Allow all on trips" on public.trips for all using (true) with check (true);

drop policy if exists "Allow all on bookings" on public.bookings;
create policy "Allow all on bookings" on public.bookings for all using (true) with check (true);

drop policy if exists "Allow all on goods" on public.goods;
create policy "Allow all on goods" on public.goods for all using (true) with check (true);

drop policy if exists "Allow all on incidents" on public.incidents;
create policy "Allow all on incidents" on public.incidents for all using (true) with check (true);

drop policy if exists "Allow all on notifications" on public.notifications;
create policy "Allow all on notifications" on public.notifications for all using (true) with check (true);

-- ---------------------------------------------------------------------
-- 13. SEED DATA (Clean B2B Factory-to-Factory Data)
-- ---------------------------------------------------------------------

-- Factory Logistics Hubs
insert into public.operators (id, name, code, contact_phone, fleet_count, rating, status)
values
    ('op-1', 'Phnom Penh SEZ Central Logistics Hub', 'PP-SEZ-01', '+855 23 888 999', 18, 4.9, 'active'),
    ('op-2', 'Sihanoukville Port Deep Sea Terminal', 'SHV-PORT-02', '+855 34 777 666', 12, 4.8, 'active'),
    ('op-3', 'Bavet Industrial Logistics Park', 'BVT-SEZ-03', '+855 44 555 444', 9, 4.7, 'active')
on conflict (id) do update set name = excluded.name;

-- Users (Super Admin, Dispatchers, Lead Heavy Drivers, Factory Managers)
insert into public.users (id, full_name, email, phone, role, operator_id, factory_name, status, avatar)
values
    ('11111111-1111-1111-1111-111111111111', 'Bong Leak (Freight Director)', 'admin@voleakexpress.com', '+855 12 999 001', 'super_admin', 'op-1', 'Voleak Express HQ', 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'),
    ('22222222-2222-2222-2222-222222222222', 'Sokha Meng (SEZ Dispatch Manager)', 'sokha.m@voleakexpress.com', '+855 12 888 101', 'manager', 'op-1', 'PP SEZ Logistics Hub', 'active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'),
    ('33333333-3333-3333-3333-333333333333', 'Dara Chan (Lead Heavy Truck Driver)', 'dara.chan@voleakexpress.com', '+855 98 777 001', 'driver', 'op-1', 'Fleet Division A', 'active', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'),
    ('44444444-4444-4444-4444-444444444444', 'Rithy Seng (Freight Loader & Co-Driver)', 'rithy.seng@voleakexpress.com', '+855 98 777 002', 'conductor', 'op-1', 'Fleet Division A', 'active', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'),
    ('55555555-5555-5555-5555-555555555555', 'Manhattan Textile Mills Ltd', 'logistics@manhattan-textiles.com', '+855 23 111 222', 'corporate', 'op-1', 'Manhattan Garment Plant #3', 'active', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=150&q=80')
on conflict (id) do update set full_name = excluded.full_name;

-- Heavy Freight Trucks
insert into public.trucks (id, operator_id, plate_number, model, capacity_tons, status, truck_type)
values
    ('b-1', 'op-1', 'PP-3D-8890', 'Scania R450 Heavy 40ft Container Truck', 28.00, 'active', 'Container Heavy Trailer (25T)'),
    ('b-2', 'op-1', 'PP-3E-1234', 'Hino 700 Series Flatbed Heavy Hauler', 18.00, 'active', 'Medium Cargo Truck (8T)'),
    ('b-3', 'op-2', 'SHV-3B-9988', 'Isuzu Giga 40ft Port Container Carrier', 30.00, 'active', 'Container Heavy Trailer (25T)'),
    ('b-4', 'op-3', 'BVT-3A-7766', 'Hyundai HD270 Cold-Chain Industrial Trailer', 15.00, 'maintenance', 'Refrigerated Cold Truck (10T)')
on conflict (id) do update set model = excluded.model;

-- Factory Corridors
insert into public.routes (id, operator_id, name, origin, destination, distance_km, duration_hours, stops)
values
    ('r-1', 'op-1', 'Phnom Penh SEZ ⇄ Sihanoukville Port Deep Sea Terminal', 'PP SEZ Plant Gate 1', 'Sihanoukville Port Container Terminal', 187, 2.5, '["Kampong Speu Toll Plaza", "Phnom Sruoch Weighbridge"]'::jsonb),
    ('r-2', 'op-1', 'Phnom Penh Industrial Zone ⇄ Bavet Border SEZ', 'Phnom Penh Logistics Depot', 'Bavet International Border Logistics Hub', 165, 3.0, '["Neak Loeung Bridge", "Svay Rieng Checkpoint"]'::jsonb),
    ('r-3', 'op-2', 'Sihanoukville Special Economic Zone ⇄ Phnom Penh Central Port', 'SHV SEZ Facility', 'Phnom Penh Autonomous Port', 195, 3.2, '["Preah Sihanouk Weigh Station", "Highway Toll 2"]'::jsonb)
on conflict (id) do update set name = excluded.name;

-- Dispatch Schedules
insert into public.schedules (id, route_id, truck_id, bus_id, driver_id, conductor_id, departure_time, arrival_time, days_of_week, price, base_price)
values
    ('s-1', 'r-1', 'b-1', 'b-1', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '06:00 AM', '09:00 AM', 'Daily Factory Express', 120.00, 120.00),
    ('s-2', 'r-2', 'b-2', 'b-2', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '08:30 AM', '12:00 PM', 'Mon-Sat Industrial Freight', 95.00, 95.00)
on conflict (id) do update set price = excluded.price;

-- Factory Voyages (Trips)
insert into public.trips (id, schedule_id, route_id, route_name, truck_plate, bus_plate, driver_name, truck_id, bus_id, driver_id, conductor_id, departure_time, status, speed_kmh, weight_loaded_percent, cargo_temp_celsius, next_stop, latitude, longitude)
values
    ('TRK-901', 's-1', 'r-1', 'Phnom Penh SEZ ⇄ Sihanoukville Port Deep Sea Terminal', 'PP-3D-8890', 'PP-3D-8890', 'Dara Chan', 'b-1', 'b-1', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '06:00 AM', 'in_progress', 78, 92, 4, 'Phnom Sruoch Weighbridge', 11.4123, 104.4521),
    ('TRK-902', 's-2', 'r-2', 'Phnom Penh Industrial Zone ⇄ Bavet Border SEZ', 'PP-3E-1234', 'PP-3E-1234', 'Dara Chan', 'b-2', 'b-2', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '08:30 AM', 'scheduled', 0, 75, 24, 'PP Industrial Hub Depot', 11.5564, 104.9282)
on conflict (id) do update set status = excluded.status;

-- B2B Factory Waybills (Bookings)
insert into public.bookings (id, trip_id, passenger_id, sender, receiver, passenger_name, seat_number, cargo_type, status, total_price, cod_amount, qr_code)
values
    ('WB-8801', 'TRK-901', '55555555-5555-5555-5555-555555555555', 'Manhattan Textile Mills Ltd', 'Sihanoukville Port Logistics Bay #4', 'Manhattan Textile Mills', '22.5 Tons (Textile Garments)', 'Finished Apparel & Fabrics', 'confirmed', 240.00, 12500.00, 'VKX-WB-8801-FACTORY-EXPORT'),
    ('WB-8802', 'TRK-901', '55555555-5555-5555-5555-555555555555', 'Minebea Electronics Assembly SEZ', 'Japan Export Maritime Terminal', 'Minebea Electronics', '6.0 Tons (Precision Micro-Motors)', 'Electronics Components', 'boarded', 180.00, 8900.00, 'VKX-WB-8802-SEZ-SHV'),
    ('WB-8803', 'TRK-902', '55555555-5555-5555-5555-555555555555', 'Phnom Penh Auto Parts Plant #2', 'Bavet Automotive Assembly Facility', 'PP Auto Parts Plant', '14.0 Tons (Stamped Steel Panels)', 'Heavy Industrial Metals', 'pending', 310.00, 4500.00, 'VKX-WB-8803-BVT-CROSSBORDER')
on conflict (id) do update set status = excluded.status;

-- Factory Incidents
insert into public.incidents (id, incident_type, reported_by, trip_id, description, timestamp, status, type)
values
    ('inc-1', 'Weighbridge Inspection Delay', 'Dara Chan', 'TRK-901', 'Routine highway axle weight inspection at Phnom Sruoch weigh station. Lead time +15 min.', '2026-08-19 07:30 AM', 'resolved', 'delay'),
    ('inc-2', 'Port Customs Queue', 'Sokha Meng', 'TRK-902', 'Port terminal export clearance queue for 40ft container bays.', '2026-08-19 10:15 AM', 'under_review', 'delay')
on conflict (id) do update set status = excluded.status;
