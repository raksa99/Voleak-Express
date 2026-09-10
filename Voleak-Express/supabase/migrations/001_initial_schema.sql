-- =====================================================================
-- VOLEAK EXPRESS — PRODUCTION POSTGRES MIGRATION SCRIPT FOR SUPABASE
-- Complete unified schema for Truck & Cargo Fleet Logistics
-- (Supports React Admin Dashboard + Flutter Driver/Client Mobile App)
-- =====================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. OPERATORS (Logistics Partners & Hub Companies)
-- ---------------------------------------------------------------------
create table if not exists public.operators (
    id text primary key default ('op-' || substr(md5(random()::text), 1, 8)),
    name text not null,
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
-- 2. USERS (Staff, Drivers, Conductors, Warehouse Admins, Senders/Clients)
-- ---------------------------------------------------------------------
create table if not exists public.users (
    id uuid primary key default gen_random_uuid(),
    auth_user_id uuid unique,
    name text,
    full_name text not null,
    email text unique,
    phone text,
    role text not null default 'passenger' check (
        role in ('super_admin', 'admin', 'operator_admin', 'manager', 'driver', 'conductor', 'passenger', 'corporate', 'cooperator')
    ),
    status text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
    operator_id text references public.operators(id) on delete set null,
    age integer,
    nationality text default 'Cambodian',
    card_id_url text,
    avatar text,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 3. BUSES / TRUCKS (Freight Fleet Registry)
-- ---------------------------------------------------------------------
create table if not exists public.buses (
    id text primary key default ('b-' || substr(md5(random()::text), 1, 8)),
    operator_id text references public.operators(id) on delete set null,
    plate_number text unique not null,
    model text not null,
    capacity integer not null default 10,
    status text not null default 'active' check (status in ('active', 'maintenance', 'retired')),
    truck_type text default 'Cargo Freight Truck',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 4. ROUTES (Express Shipping Corridors & Hub Waypoints)
-- ---------------------------------------------------------------------
create table if not exists public.routes (
    id text primary key default ('r-' || substr(md5(random()::text), 1, 8)),
    operator_id text references public.operators(id) on delete set null,
    name text not null,
    origin text not null,
    destination text not null,
    distance_km numeric(8, 2) default 0,
    duration_min integer default 0,
    duration_hours numeric(5, 2) default 0,
    status text default 'active' check (status in ('active', 'inactive')),
    stops jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 5. SCHEDULES (Daily / Weekly Truck Dispatch Manifests)
-- ---------------------------------------------------------------------
create table if not exists public.schedules (
    id text primary key default ('s-' || substr(md5(random()::text), 1, 8)),
    route_id text not null references public.routes(id) on delete cascade,
    bus_id text references public.buses(id) on delete set null,
    driver_id uuid references public.users(id) on delete set null,
    conductor_id uuid references public.users(id) on delete set null,
    departure_time text not null,
    arrival_time text not null,
    days_of_week text default 'Daily',
    price numeric(10, 2) default 0.00,
    base_price numeric(10, 2) default 0.00,
    status text default 'active' check (status in ('active', 'inactive', 'cancelled')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 6. TRIPS (Live Highway Trips & Realtime GPS Telemetry)
-- ---------------------------------------------------------------------
create table if not exists public.trips (
    id text primary key default ('TRK-' || floor(random() * 900 + 100)::text),
    schedule_id text references public.schedules(id) on delete set null,
    route_id text references public.routes(id) on delete set null,
    route_name text,
    bus_plate text,
    driver_name text,
    trip_date date default current_date not null,
    bus_id text references public.buses(id) on delete set null,
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
-- 7. BOOKINGS / WAYBILLS (Cargo Shipments & Parcels)
-- ---------------------------------------------------------------------
create table if not exists public.bookings (
    id text primary key default ('WB-' || floor(random() * 9000 + 1000)::text),
    trip_id text references public.trips(id) on delete set null,
    passenger_id uuid references public.users(id) on delete set null,
    seat_number text,
    status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'boarded', 'cancelled')),
    total_price numeric(10, 2) default 0.00,
    booked_at timestamp with time zone default timezone('utc'::text, now()) not null,
    booking_channel text default 'Express Parcel',
    passenger_name text,
    passenger_age integer,
    passenger_phone text,
    passenger_nationality text default 'Cambodian',
    sender text,
    receiver text,
    cod_amount numeric(10, 2) default 0.00,
    qr_code text unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 8. TICKETS (Waybill QR Scans & Proof of Delivery)
-- ---------------------------------------------------------------------
create table if not exists public.tickets (
    id text primary key default ('tkt-' || substr(md5(random()::text), 1, 8)),
    booking_id text references public.bookings(id) on delete cascade,
    qr_code text not null,
    status text not null default 'valid' check (status in ('valid', 'used', 'cancelled')),
    scanned_at timestamp with time zone,
    scanned_by uuid references public.users(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 9. GOODS (Freight Parcels & Cargo Packages)
-- ---------------------------------------------------------------------
create table if not exists public.goods (
    id text primary key default ('g-' || substr(md5(random()::text), 1, 8)),
    trip_id text references public.trips(id) on delete set null,
    sender_name text not null,
    receiver_name text not null,
    receiver_phone text not null,
    description text not null,
    weight_kg numeric(8, 2) not null default 1.0,
    status text not null default 'pending' check (status in ('pending', 'loaded', 'in_transit', 'delivered', 'cancelled')),
    corporate_id text,
    qr_code text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 10. INCIDENTS (Shipping Exceptions & Delay Logs)
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
-- 11. NOTIFICATIONS
-- ---------------------------------------------------------------------
create table if not exists public.notifications (
    id text primary key default ('notif-' || substr(md5(random()::text), 1, 8)),
    user_id uuid references public.users(id) on delete cascade,
    title text not null,
    body text not null,
    type text default 'general',
    reference_type text,
    reference_id text,
    is_read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 12. PROMOTIONS
-- ---------------------------------------------------------------------
create table if not exists public.promotions (
    id text primary key default ('promo-' || substr(md5(random()::text), 1, 8)),
    title text not null,
    code text unique not null,
    discount_percent numeric(5, 2) not null,
    valid_until timestamp with time zone,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 13. REALTIME REPLICATION SETUP
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
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------
alter table public.operators enable row level security;
alter table public.users enable row level security;
alter table public.buses enable row level security;
alter table public.routes enable row level security;
alter table public.schedules enable row level security;
alter table public.trips enable row level security;
alter table public.bookings enable row level security;
alter table public.tickets enable row level security;
alter table public.goods enable row level security;
alter table public.incidents enable row level security;
alter table public.notifications enable row level security;
alter table public.promotions enable row level security;

create policy "Allow read on operators" on public.operators for select using (true);
create policy "Allow insert on operators" on public.operators for insert with check (true);
create policy "Allow update on operators" on public.operators for update using (true);

create policy "Allow read on users" on public.users for select using (true);
create policy "Allow insert on users" on public.users for insert with check (true);
create policy "Allow update on users" on public.users for update using (true);

create policy "Allow read on buses" on public.buses for select using (true);
create policy "Allow insert on buses" on public.buses for insert with check (true);
create policy "Allow update on buses" on public.buses for update using (true);

create policy "Allow read on routes" on public.routes for select using (true);
create policy "Allow insert on routes" on public.routes for insert with check (true);
create policy "Allow update on routes" on public.routes for update using (true);

create policy "Allow read on schedules" on public.schedules for select using (true);
create policy "Allow insert on schedules" on public.schedules for insert with check (true);
create policy "Allow update on schedules" on public.schedules for update using (true);

create policy "Allow read on trips" on public.trips for select using (true);
create policy "Allow insert on trips" on public.trips for insert with check (true);
create policy "Allow update on trips" on public.trips for update using (true);

create policy "Allow read on bookings" on public.bookings for select using (true);
create policy "Allow insert on bookings" on public.bookings for insert with check (true);
create policy "Allow update on bookings" on public.bookings for update using (true);

create policy "Allow read on tickets" on public.tickets for select using (true);
create policy "Allow insert on tickets" on public.tickets for insert with check (true);
create policy "Allow update on tickets" on public.tickets for update using (true);

create policy "Allow read on goods" on public.goods for select using (true);
create policy "Allow insert on goods" on public.goods for insert with check (true);
create policy "Allow update on goods" on public.goods for update using (true);

create policy "Allow read on incidents" on public.incidents for select using (true);
create policy "Allow insert on incidents" on public.incidents for insert with check (true);
create policy "Allow update on incidents" on public.incidents for update using (true);

create policy "Allow read on notifications" on public.notifications for select using (true);
create policy "Allow insert on notifications" on public.notifications for insert with check (true);
create policy "Allow update on notifications" on public.notifications for update using (true);

create policy "Allow read on promotions" on public.promotions for select using (true);

-- ---------------------------------------------------------------------
-- 15. SEED DATA
-- ---------------------------------------------------------------------
insert into public.operators (id, name, code, contact_phone, fleet_count, rating, status)
values
    ('op-1', 'Voleak Express Heavy Freight', 'VKX-LOG', '+855 23 888 999', 14, 4.9, 'active'),
    ('op-2', 'Angkor Trans-Regional Logistics', 'AKR-LOG', '+855 63 777 666', 8, 4.7, 'active'),
    ('op-3', 'Mekong Cold Chain & Container', 'MKG-COLD', '+855 34 555 444', 6, 4.8, 'active')
on conflict (id) do nothing;

insert into public.users (id, full_name, email, phone, role, operator_id, status, avatar)
values
    ('11111111-1111-1111-1111-111111111111', 'Bong Leak (Super Admin)', 'admin@voleakexpress.com', '+855 12 999 001', 'super_admin', 'op-1', 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'),
    ('22222222-2222-2222-2222-222222222222', 'Sokha Meng (Warehouse Dispatcher)', 'sokha.m@voleakexpress.com', '+855 12 888 101', 'operator_admin', 'op-1', 'active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'),
    ('33333333-3333-3333-3333-333333333333', 'Dara Chan (Lead Truck Driver)', 'dara.chan@voleakexpress.com', '+855 98 777 001', 'driver', 'op-1', 'active', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'),
    ('44444444-4444-4444-4444-444444444444', 'Rithy Seng (Cargo Loader / Co-Driver)', 'rithy.seng@voleakexpress.com', '+855 98 777 002', 'conductor', 'op-1', 'active', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'),
    ('55555555-5555-5555-5555-555555555555', 'Lucky Mart Tuol Kork (Client / Sender)', 'orders@luckymart-tk.com', '+855 23 111 222', 'passenger', 'op-1', 'active', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=150&q=80')
on conflict (id) do nothing;

insert into public.buses (id, operator_id, plate_number, model, capacity, status, truck_type)
values
    ('b-1', 'op-1', 'PP-3D-8890', 'Scania R450 Heavy Container Trailer', 25, 'active', 'Container Heavy Trailer (25T)'),
    ('b-2', 'op-1', 'PP-3E-1234', 'Hino 500 Medium Cargo Truck', 8, 'active', 'Medium Cargo Truck (8T)'),
    ('b-3', 'op-2', 'SR-3B-9988', 'Isuzu Giga Heavy Duty Freight', 20, 'active', 'Container Heavy Trailer (25T)'),
    ('b-4', 'op-3', 'SHV-3A-7766', 'Hyundai HD270 Cold Chain Refrigerated', 10, 'maintenance', 'Refrigerated Cold Truck (10T)')
on conflict (id) do nothing;

insert into public.routes (id, operator_id, name, origin, destination, distance_km, duration_hours, stops)
values
    ('r-1', 'op-1', 'Phnom Penh Hub ⇄ Siem Reap Hub (NR6)', 'Phnom Penh Central Hub', 'Siem Reap Logistics Depot', 314, 5.5, '["Skun Waypoint", "Kampong Thom Hub"]'::jsonb),
    ('r-2', 'op-1', 'Phnom Penh Express ⇄ Sihanoukville Port (Expressway)', 'Phnom Penh Logistics Port', 'Sihanoukville Deep Sea Port', 187, 2.5, '["Kampong Speu Toll", "Phnom Sruoch Checkpoint"]'::jsonb),
    ('r-3', 'op-2', 'Phnom Penh ⇄ Battambang Regional Warehouse (NR5)', 'Phnom Penh Central Hub', 'Battambang Regional Hub', 291, 5.0, '["Kampong Chhnang Hub", "Pursat Checkpoint"]'::jsonb)
on conflict (id) do nothing;

insert into public.schedules (id, route_id, bus_id, driver_id, conductor_id, departure_time, arrival_time, days_of_week, price, base_price)
values
    ('s-1', 'r-1', 'b-1', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '06:30 AM', '12:00 PM', 'Daily Morning Express', 35.00, 35.00),
    ('s-2', 'r-2', 'b-2', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '08:00 AM', '10:30 AM', 'Mon, Wed, Fri Expressway', 25.00, 25.00)
on conflict (id) do nothing;

insert into public.trips (id, schedule_id, route_id, route_name, bus_plate, driver_name, bus_id, driver_id, conductor_id, departure_time, status, speed_kmh, weight_loaded_percent, cargo_temp_celsius, next_stop, latitude, longitude)
values
    ('TRK-901', 's-1', 'r-1', 'Phnom Penh Hub ⇄ Siem Reap Hub (NR6)', 'PP-3D-8890', 'Dara Chan', 'b-1', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '06:30 AM', 'in_progress', 76, 85, 4, 'Kampong Thom Hub', 12.7111, 104.8887),
    ('TRK-902', 's-2', 'r-2', 'Phnom Penh Express ⇄ Sihanoukville Port', 'PP-3E-1234', 'Dara Chan', 'b-2', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '08:00 AM', 'scheduled', 0, 60, 24, 'Phnom Penh Logistics Port', 11.5564, 104.9282)
on conflict (id) do nothing;

insert into public.bookings (id, trip_id, passenger_name, sender, receiver, seat_number, status, total_price, booking_channel, cod_amount, qr_code)
values
    ('WB-8801', 'TRK-901', 'Lucky Mart Tuol Kork', 'Lucky Mart Tuol Kork', 'Siem Reap Express Mart (012 888 777)', '450 kg / 2.5 m³', 'confirmed', 65.00, 'Express Parcel', 320.00, 'VKX-WAYBILL-8801-KH'),
    ('WB-8802', 'TRK-901', 'BKK MiniMart Express', 'BKK MiniMart Express', 'Angkor Superstore Branch #2', '120 kg / 0.8 m³', 'boarded', 28.00, 'Cold Chain / Perishable', 150.00, 'VKX-WAYBILL-8802-KH'),
    ('WB-8803', 'TRK-902', 'Phnom Penh Electric Import Co', 'Phnom Penh Electric Import Co', 'Sihanoukville Port Depot', '1,200 kg / 4.0 m³', 'pending', 180.00, 'Heavy Freight', 850.00, 'VKX-WAYBILL-8803-KH')
on conflict (id) do nothing;

insert into public.incidents (id, incident_type, reported_by, trip_id, description, timestamp, status, type)
values
    ('inc-1', 'Truck Breakdown', 'Dara Chan', 'TRK-901', 'Tire replacement needed near Kampong Thom checkpoint. Lead time +25min.', '2026-08-19 09:15 AM', 'resolved', 'breakdown'),
    ('inc-2', 'Customs Delay', 'Sokha Meng', 'TRK-902', 'Port cargo documentation inspection underway at Sihanoukville toll.', '2026-08-19 10:45 AM', 'under_review', 'delay')
on conflict (id) do nothing;
