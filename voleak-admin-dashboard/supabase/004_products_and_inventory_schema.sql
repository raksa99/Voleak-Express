-- =====================================================================
-- Voleak Express — Products & Multi-Hub Inventory Schema & Seed Migration
-- For Supabase PostgreSQL Database (https://muqgtennllxkckxxqibm.supabase.co)
-- =====================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- 1. PRODUCTS TABLE
-- ---------------------------------------------------------------------
create table if not exists public.products (
    id text primary key,
    name text not null,
    sku text unique not null,
    barcode text,
    category text default 'Packaging & Logistics',
    unit text not null default 'Pallet', -- Pallet, Drum, Carton, Roll, Piece, Bag, Box, Set
    default_price numeric(12, 2) not null default 0.00,
    cost_price numeric(12, 2) not null default 0.00,
    min_stock_alert integer default 10,
    warehouse_location text default 'General Staging Area',
    image_url text,
    description text,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 2. BRANCH STOCK (MULTI-HUB WAREHOUSE INVENTORY)
-- ---------------------------------------------------------------------
create table if not exists public.branch_stock (
    id text primary key,
    branch_id text not null, -- references operators/hubs (e.g. 'op-1', 'op-2')
    product_id text not null references public.products(id) on delete cascade,
    on_hand_quantity integer not null default 0 check (on_hand_quantity >= 0),
    reserved_quantity integer not null default 0 check (reserved_quantity >= 0),
    warehouse_location text,
    last_restocked text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(branch_id, product_id)
);

-- ---------------------------------------------------------------------
-- 3. STOCK MOVEMENTS & AUDIT LOG TABLE
-- ---------------------------------------------------------------------
create table if not exists public.stock_movements (
    id text primary key,
    movement_type text not null, -- 'inbound', 'outbound', 'transfer', 'adjustment'
    product_id text not null references public.products(id) on delete cascade,
    branch_id text not null,
    to_branch_id text,
    quantity integer not null,
    operator_name text default 'Managing Director',
    reference_no text,
    reason text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 4. COOPERATOR CONSIGNMENT STOCK TABLE
-- ---------------------------------------------------------------------
create table if not exists public.cooperator_stock (
    id text primary key,
    cooperator_id text not null,
    product_id text not null references public.products(id) on delete cascade,
    quantity integer not null default 0 check (quantity >= 0),
    unit text default 'Pallet',
    last_verified timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(cooperator_id, product_id)
);

-- ---------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------
alter table public.products enable row level security;
alter table public.branch_stock enable row level security;
alter table public.stock_movements enable row level security;
alter table public.cooperator_stock enable row level security;

-- Permissive policies for anon/authenticated access in Voleak Admin
create policy "Allow public read products" on public.products for select using (true);
create policy "Allow public insert products" on public.products for insert with check (true);
create policy "Allow public update products" on public.products for update using (true);
create policy "Allow public delete products" on public.products for delete using (true);

create policy "Allow public read branch_stock" on public.branch_stock for select using (true);
create policy "Allow public insert branch_stock" on public.branch_stock for insert with check (true);
create policy "Allow public update branch_stock" on public.branch_stock for update using (true);
create policy "Allow public delete branch_stock" on public.branch_stock for delete using (true);

create policy "Allow public read stock_movements" on public.stock_movements for select using (true);
create policy "Allow public insert stock_movements" on public.stock_movements for insert with check (true);

create policy "Allow public read cooperator_stock" on public.cooperator_stock for select using (true);
create policy "Allow public insert cooperator_stock" on public.cooperator_stock for insert with check (true);
create policy "Allow public update cooperator_stock" on public.cooperator_stock for update using (true);
create policy "Allow public delete cooperator_stock" on public.cooperator_stock for delete using (true);

