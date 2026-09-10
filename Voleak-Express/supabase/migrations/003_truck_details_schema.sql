-- =====================================================================
-- VOLEAK EXPRESS — TRUCK DETAILS & SPECIFICATIONS SCHEMA MIGRATION
-- Production Supabase PostgreSQL Migration (Safe & Robust with Images & Driver Contacts)
-- Copy & Paste into Supabase Dashboard -> SQL Editor -> Run
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. ENHANCE TRUCKS TABLE (Full Heavy Freight Specifications & Driver Contacts)
-- ---------------------------------------------------------------------
create table if not exists public.trucks (
    id text primary key default ('trk-v-' || substr(md5(random()::text), 1, 8)),
    operator_id text references public.operators(id) on delete set null,
    plate_number text unique not null,
    model text not null,
    capacity_tons numeric(6, 2) not null default 25.0,
    status text not null default 'active' check (status in ('active', 'maintenance', 'retired')),
    truck_type text not null default 'Container Heavy Trailer (25T)',
    image_url text default 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80',
    assigned_driver_name text default 'Dara Chan',
    assigned_driver_phone text default '+855 98 777 001',
    assigned_driver_email text default 'driver.dara@voleakexpress.com',
    axle_count integer default 4,
    fuel_type text default 'Diesel',
    fuel_level_percent integer default 85,
    engine_power text default '450 HP Turbo Diesel',
    home_hub_name text default 'Phnom Penh SEZ Central Hub',
    odometer_km integer default 142850,
    last_maintenance_date date default current_date,
    next_inspection_date date default '2026-12-31',
    insurance_policy_number text default 'VKX-INS-8849-KH',
    gps_tracker_id text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure all specification columns exist if table was already created
alter table public.trucks add column if not exists capacity_tons numeric(6, 2) default 25.0;
alter table public.trucks add column if not exists truck_type text default 'Container Heavy Trailer (25T)';
alter table public.trucks add column if not exists image_url text default 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80';
alter table public.trucks add column if not exists assigned_driver_name text default 'Dara Chan';
alter table public.trucks add column if not exists assigned_driver_phone text default '+855 98 777 001';
alter table public.trucks add column if not exists assigned_driver_email text default 'driver.dara@voleakexpress.com';
alter table public.trucks add column if not exists axle_count integer default 4;
alter table public.trucks add column if not exists fuel_type text default 'Diesel';
alter table public.trucks add column if not exists fuel_level_percent integer default 85;
alter table public.trucks add column if not exists engine_power text default '450 HP Turbo Diesel';
alter table public.trucks add column if not exists home_hub_name text default 'Phnom Penh SEZ Central Hub';
alter table public.trucks add column if not exists odometer_km integer default 142850;
alter table public.trucks add column if not exists last_maintenance_date date default current_date;
alter table public.trucks add column if not exists next_inspection_date date default '2026-12-31';
alter table public.trucks add column if not exists insurance_policy_number text default 'VKX-INS-8849-KH';
alter table public.trucks add column if not exists gps_tracker_id text;

-- Drop and recreate compatibility view to prevent 42P16 column position error
drop view if exists public.buses cascade;
create view public.buses as
    select
        id,
        operator_id,
        plate_number,
        model,
        capacity_tons::int as capacity,
        status,
        truck_type,
        image_url,
        assigned_driver_name,
        assigned_driver_phone,
        assigned_driver_email,
        axle_count,
        fuel_level_percent,
        engine_power,
        home_hub_name,
        odometer_km,
        next_inspection_date,
        insurance_policy_number,
        created_at
    from public.trucks;

-- ---------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------
alter table public.trucks enable row level security;

drop policy if exists "Allow all on trucks" on public.trucks;
create policy "Allow all on trucks" on public.trucks for all using (true) with check (true);

-- ---------------------------------------------------------------------
-- 3. REALTIME REPLICATION
-- ---------------------------------------------------------------------
do $$ begin
    alter publication supabase_realtime add table public.trucks;
exception
    when others then null;
end $$;

-- ---------------------------------------------------------------------
-- 4. SEED DATA: HEAVY CONTAINER FREIGHT FLEET WITH PHOTOS & CONTACTS
-- ---------------------------------------------------------------------
insert into public.trucks (
    id, operator_id, plate_number, model, capacity_tons, status, truck_type, image_url,
    assigned_driver_name, assigned_driver_phone, assigned_driver_email,
    axle_count, engine_power, fuel_level_percent,
    home_hub_name, odometer_km, next_inspection_date, insurance_policy_number
) values
(
    'b-1',
    (select id from public.operators where code = 'PP-SEZ-01' limit 1),
    'PP-3D-8890',
    'Scania R450 Heavy 40ft Container Truck',
    28.00,
    'active',
    'Container Heavy Trailer (25T)',
    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80',
    'Dara Chan',
    '+855 98 777 001',
    'dara.chan@voleakexpress.com',
    4,
    '450 HP Turbo Diesel',
    88,
    'Phnom Penh SEZ Central Hub',
    142850,
    '2026-12-31',
    'VKX-INS-8849-KH'
),
(
    'b-2',
    (select id from public.operators where code in ('PP-SEZ-01', 'SHV-PORT-02') limit 1),
    'PP-3E-1234',
    'Hino 700 Series Flatbed Heavy Hauler',
    18.00,
    'active',
    'Medium Cargo Truck (8T)',
    'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80',
    'Sokha Meng',
    '+855 12 888 101',
    'sokha.meng@voleakexpress.com',
    3,
    '380 HP Heavy Diesel',
    75,
    'Phnom Penh Logistics Depot',
    98400,
    '2026-11-15',
    'VKX-INS-7721-KH'
),
(
    'b-3',
    (select id from public.operators where code in ('PAS-SHV-02', 'SHV-PORT-02') limit 1),
    'SHV-3B-9988',
    'Isuzu Giga 40ft Port Container Carrier',
    30.00,
    'active',
    'Container Heavy Trailer (25T)',
    'https://images.unsplash.com/photo-1586191582150-13f837330752?auto=format&fit=crop&w=800&q=80',
    'Vannak Kem',
    '+855 12 456 789',
    'vannak.kem@voleakexpress.com',
    5,
    '520 HP Heavy Marine Hauler',
    92,
    'Sihanoukville Port Gateway',
    184200,
    '2027-01-20',
    'VKX-INS-9912-SHV'
),
(
    'b-4',
    (select id from public.operators where code in ('BVT-SEZ-03', 'BVT-PORT-03') limit 1),
    'BVT-3A-7766',
    'Hyundai HD270 Cold-Chain Industrial Trailer',
    15.00,
    'maintenance',
    'Refrigerated Cold Truck (10T)',
    'https://images.unsplash.com/photo-1586191582150-13f837330752?auto=format&fit=crop&w=800&q=80',
    'Chanthy Mao',
    '+855 97 712 333',
    'chanthy.mao@voleakexpress.com',
    3,
    '340 HP Reefer Diesel',
    45,
    'Bavet Manhattan SEZ Depot',
    124000,
    '2026-09-30',
    'VKX-INS-6632-BVT'
),
(
    'b-5',
    (select id from public.operators where code = 'AKR-SEZ-01' limit 1),
    'AKR-3F-5544',
    'Volvo FH16 60-Ton Heavy Lowboy Transporter',
    35.00,
    'active',
    'Heavy Flatbed (30T)',
    'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?auto=format&fit=crop&w=800&q=80',
    'Rithy Seng',
    '+855 12 958 888',
    'rithy.seng@voleakexpress.com',
    6,
    '600 HP Heavy Hauler',
    80,
    'AKR Special Economic Zone',
    76500,
    '2027-03-10',
    'VKX-INS-5544-AKR'
)
on conflict (id) do update set
    plate_number = excluded.plate_number,
    model = excluded.model,
    capacity_tons = excluded.capacity_tons,
    status = excluded.status,
    truck_type = excluded.truck_type,
    image_url = excluded.image_url,
    assigned_driver_name = excluded.assigned_driver_name,
    assigned_driver_phone = excluded.assigned_driver_phone,
    assigned_driver_email = excluded.assigned_driver_email,
    axle_count = excluded.axle_count,
    engine_power = excluded.engine_power,
    home_hub_name = excluded.home_hub_name;
