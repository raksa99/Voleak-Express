-- =====================================================================
-- VOLEAK EXPRESS — INDUSTRIAL HUB PARTNERS & COMPANY SETTINGS MIGRATION
-- Production Supabase PostgreSQL Migration
-- Copy & Paste into Supabase Dashboard -> SQL Editor -> Run
-- =====================================================================

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. ENHANCE OPERATORS / INDUSTRIAL HUB PARTNERS TABLE
-- ---------------------------------------------------------------------
create table if not exists public.operators (
    id text primary key default ('hub-' || substr(md5(random()::text), 1, 8)),
    name text not null,
    code text unique not null,
    province text default 'Phnom Penh',
    address text not null default 'National Road Logistics Corridor',
    latitude double precision default 11.5564,
    longitude double precision default 104.9282,
    contact text,
    contact_phone text default '+855 23 888 999',
    manager_name text default 'SEZ Operations Director',
    manager_phone text default '+855 12 888 123',
    operating_hours text default '24/7 Gate Dispatch',
    loading_bays integer default 12,
    weighbridge_capacity text default '80 Tons Axle Scale',
    fleet_count integer default 10,
    rating numeric(3, 2) default 4.9,
    status text default 'active' check (status in ('active', 'inactive', 'suspended')),
    amenities text[] default array['Driver Rest Lounge', 'Diesel Fuel Pump', '24/7 Security'],
    logo_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure all columns exist if table was already created
alter table public.operators add column if not exists province text default 'Phnom Penh';
alter table public.operators add column if not exists address text default 'National Road Logistics Corridor';
alter table public.operators add column if not exists latitude double precision default 11.5564;
alter table public.operators add column if not exists longitude double precision default 104.9282;
alter table public.operators add column if not exists manager_name text default 'SEZ Operations Director';
alter table public.operators add column if not exists manager_phone text default '+855 12 888 123';
alter table public.operators add column if not exists operating_hours text default '24/7 Gate Dispatch';
alter table public.operators add column if not exists loading_bays integer default 12;
alter table public.operators add column if not exists weighbridge_capacity text default '80 Tons Axle Scale';
alter table public.operators add column if not exists amenities text[] default array['Driver Rest Lounge', 'Diesel Fuel Pump', '24/7 Security'];

-- ---------------------------------------------------------------------
-- 2. COMPANY PROFILE & HEADQUARTERS CONFIGURATION TABLE
-- ---------------------------------------------------------------------
create table if not exists public.company_profile (
    id text primary key default 'primary_hq',
    name text not null default 'Voleak Express Co., Ltd.',
    code text not null default 'VOLEAK-HQ',
    tagline text default 'Factory-to-Factory Heavy Freight Logistics',
    phone text default '+855 12 888 999',
    email text default 'dispatch@voleakexpress.com',
    director text default 'Bong Leak (Managing Director)',
    tax_id text default 'K002-98471203',
    province text default 'Phnom Penh',
    address text default 'National Road 4 Logistics Corridor, Phnom Penh Base',
    latitude double precision default 11.5564,
    longitude double precision default 104.9282,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 3. ENTERPRISE SYSTEM DISPATCH & FINANCIAL SETTINGS TABLE
-- ---------------------------------------------------------------------
create table if not exists public.system_settings (
    id text primary key default 'primary_config',
    max_axle_weight_tons numeric(6, 2) default 80.0,
    speed_governor_limit_kmh integer default 80,
    loading_bay_buffer_minutes integer default 30,
    demurrage_grace_hours integer default 24,
    primary_currency text default 'USD',
    vat_tax_rate_percent numeric(5, 2) default 10.0,
    cod_settlement_cycle text default 'daily',
    fuel_surcharge_percent numeric(5, 2) default 5.5,
    driver_commission_percent numeric(5, 2) default 15.0,
    telegram_bot_token text default '',
    telegram_chat_id text default '',
    enable_telegram_alerts boolean default true,
    alert_on_overload boolean default true,
    alert_on_delay boolean default true,
    alert_on_breakdown boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------
alter table public.operators enable row level security;
alter table public.company_profile enable row level security;
alter table public.system_settings enable row level security;

drop policy if exists "Allow all on operators" on public.operators;
create policy "Allow all on operators" on public.operators for all using (true) with check (true);

drop policy if exists "Allow all on company_profile" on public.company_profile;
create policy "Allow all on company_profile" on public.company_profile for all using (true) with check (true);

drop policy if exists "Allow all on system_settings" on public.system_settings;
create policy "Allow all on system_settings" on public.system_settings for all using (true) with check (true);

-- ---------------------------------------------------------------------
-- 5. REALTIME REPLICATION
-- ---------------------------------------------------------------------
do $$ begin
    alter publication supabase_realtime add table public.operators;
    alter publication supabase_realtime add table public.company_profile;
    alter publication supabase_realtime add table public.system_settings;
exception
    when others then null;
end $$;

-- ---------------------------------------------------------------------
-- 6. SEED DATA: COMPANY HQ & CAMBODIA INDUSTRIAL SEZ HUBS
-- ---------------------------------------------------------------------

-- Seed Company HQ
insert into public.company_profile (
    id, name, code, tagline, phone, email, director, tax_id, province, address, latitude, longitude
) values (
    'primary_hq',
    'Voleak Express Co., Ltd.',
    'VOLEAK-HQ',
    'Factory-to-Factory Heavy Freight Logistics',
    '+855 12 888 999',
    'dispatch@voleakexpress.com',
    'Bong Leak (Managing Director)',
    'K002-98471203',
    'Phnom Penh',
    'National Road 4 Logistics Corridor, Phnom Penh Base',
    11.5564,
    104.9282
) on conflict (id) do update set
    name = excluded.name,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    address = excluded.address;

-- Seed Default Enterprise System Settings
insert into public.system_settings (
    id, max_axle_weight_tons, speed_governor_limit_kmh, loading_bay_buffer_minutes, demurrage_grace_hours,
    primary_currency, vat_tax_rate_percent, cod_settlement_cycle, enable_telegram_alerts
) values (
    'primary_config', 80.0, 80, 30, 24, 'USD', 10.0, 'daily', true
) on conflict (id) do update set
    max_axle_weight_tons = excluded.max_axle_weight_tons;

-- Seed Cambodia Industrial SEZ Hub Partners
insert into public.operators (
    id, name, code, province, address, latitude, longitude, contact_phone, manager_name, manager_phone,
    operating_hours, loading_bays, weighbridge_capacity, fleet_count, rating, status, amenities
) values
(
    'hub-akr-01',
    'AKR Special Economic Zone (AKR SEZ) Logistics Hub',
    'AKR-SEZ-01',
    'Svay Rieng',
    'AKR Special Economic Zone, National Road 1 Corridor, Svay Rieng Province, Cambodia',
    11.0479485,
    106.1204302,
    '+855 44 888 123',
    'SEZ Operations Director',
    '+855 12 888 123',
    '24/7 Gate Dispatch',
    24,
    '100 Tons Axle Scale',
    26,
    5.0,
    'active',
    array['Customs Clearance Gate', 'Container Stacking Yard', 'Driver Rest Lounge', 'Diesel Fuel Pump', '24/7 Security']
),
(
    'hub-pp-01',
    'Phnom Penh SEZ Central Logistics Hub',
    'PP-SEZ-01',
    'Phnom Penh',
    'National Road 4, PPSEZ Zone A, Pou Senchey',
    11.5234,
    104.7812,
    '+855 23 999 101',
    'Sokha Rith',
    '+855 12 991 101',
    '24/7 Gate Dispatch',
    16,
    '80 Tons Axle Scale',
    24,
    4.9,
    'active',
    array['Driver Rest Lounge', 'Diesel Fuel Pump', 'Heavy Crane (50T)', 'Cold Storage', '24/7 Security']
),
(
    'hub-shv-02',
    'Sihanoukville Autonomous Port Gateway Hub',
    'PAS-SHV-02',
    'Preah Sihanouk',
    'Port Autonomous Road 3, Terminal Gateway 2',
    10.6385,
    103.5186,
    '+855 34 933 456',
    'Vannak Kem',
    '+855 12 456 789',
    '24/7 Gate Dispatch',
    24,
    '100 Tons Axle Scale',
    32,
    5.0,
    'active',
    array['Driver Rest Lounge', 'Container Stacking Crane', 'Customs Green-Lane', 'Diesel Fuel Pump']
),
(
    'hub-bvt-03',
    'Bavet Manhattan SEZ Border Logistics Center',
    'BVT-SEZ-03',
    'Svay Rieng',
    'National Road 1, Manhattan SEZ Gate 1, Bavet City',
    11.0825,
    106.1485,
    '+855 44 712 333',
    'Chanthy Mao',
    '+855 97 712 333',
    '05:00 AM - 11:00 PM',
    12,
    '80 Tons Axle Scale',
    18,
    4.8,
    'active',
    array['Cross-Border Clearance', 'Driver Rest Lounge', 'Forklift Service', '24/7 Security']
),
(
    'hub-ppt-04',
    'Poipet O’Neang SEZ Cross-Border Terminal',
    'PPT-SEZ-04',
    'Banteay Meanchey',
    'National Road 5, O’Neang SEZ Depot, Poipet Gate',
    13.6588,
    102.5852,
    '+855 54 958 888',
    'Rithy Seng',
    '+855 12 958 888',
    '06:00 AM - 10:00 PM',
    14,
    '80 Tons Axle Scale',
    15,
    4.7,
    'active',
    array['Thai-Cambodia Border Transit', 'Diesel Fuel Pump', 'Driver Shower & Lounge', '24/7 Security']
),
(
    'hub-rep-05',
    'Siem Reap Central Cargo & Freight Depot',
    'REP-HUB-05',
    'Siem Reap',
    'National Road 6, Svay Dangkum Logistics Zone',
    13.3671,
    103.8448,
    '+855 63 963 852',
    'Dara Chamroeun',
    '+855 17 963 852',
    '24/7 Gate Dispatch',
    10,
    '60 Tons Axle Scale',
    14,
    4.9,
    'active',
    array['Cold-Chain Dairy/Produce', 'Driver Rest Lounge', 'Forklift Service', '24/7 Security']
),
(
    'hub-btb-06',
    'Battambang Regional Agro Logistics Hub',
    'BTB-HUB-06',
    'Battambang',
    'National Road 5, Sangke Agricultural Freight Terminal',
    13.0957,
    103.2022,
    '+855 53 952 111',
    'Bopha Vong',
    '+855 11 952 111',
    '06:00 AM - 09:00 PM',
    8,
    '80 Tons Axle Scale',
    12,
    4.8,
    'active',
    array['Grain & Produce Silos', 'Weighbridge Lane', 'Driver Lounge', 'Fuel Station']
)
on conflict (id) do update set
    name = excluded.name,
    code = excluded.code,
    province = excluded.province,
    address = excluded.address,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    manager_name = excluded.manager_name,
    manager_phone = excluded.manager_phone,
    loading_bays = excluded.loading_bays,
    weighbridge_capacity = excluded.weighbridge_capacity,
    amenities = excluded.amenities;
