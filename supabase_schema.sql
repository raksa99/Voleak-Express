-- =====================================================================
-- Voleak Express — Supabase Postgres Schema & RLS Policies
-- Single Source of Truth for Multi-Branch Stock Delivery Platform
-- =====================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- 1. ENUMS & CUSTOM TYPES
-- ---------------------------------------------------------------------
do $$ begin
    create type user_role as enum ('admin', 'manager', 'driver', 'cooperator');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type order_status as enum (
        'requested',
        'stock_reserved',
        'approved',
        'assigned',
        'picked_up',
        'delivered',
        'confirmed',
        'disputed',
        'resolved',
        'cancelled'
    );
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type delivery_status as enum ('pending', 'picked_up', 'in_transit', 'delivered', 'failed');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type dispute_status as enum ('open', 'under_review', 'resolved_accepted', 'resolved_rejected');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type route_status as enum ('draft', 'assigned', 'in_progress', 'completed', 'cancelled');
exception
    when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------
-- 2. TABLES DEFINITION
-- ---------------------------------------------------------------------

-- Branches table
create table if not exists public.branches (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    code text unique not null,
    address text not null,
    phone text,
    admin_id uuid,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Users profiles table (linked to auth.users)
create table if not exists public.users (
    id uuid primary key,
    role user_role not null default 'cooperator',
    branch_id uuid references public.branches(id) on delete set null,
    full_name text not null,
    phone text,
    email text,
    avatar_url text,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products catalog & pricing table
create table if not exists public.products (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    sku text unique not null,
    unit text not null default 'box', -- e.g. box, pack, bottle, kg
    category text default 'General',
    default_price numeric(12, 2) not null default 0.00,
    min_stock_alert integer default 10,
    image_url text,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Branch Stock (Inventory per branch with soft reservation)
-- Available-to-promise = on_hand_quantity - reserved_quantity (§4.3)
create table if not exists public.branch_stock (
    id uuid primary key default uuid_generate_v4(),
    branch_id uuid not null references public.branches(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete cascade,
    on_hand_quantity integer not null default 0 check (on_hand_quantity >= 0),
    reserved_quantity integer not null default 0 check (reserved_quantity >= 0),
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(branch_id, product_id)
);

-- Cooperator Stock (Current verified inventory at cooperator shop)
create table if not exists public.cooperator_stock (
    id uuid primary key default uuid_generate_v4(),
    cooperator_id uuid not null references public.users(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete cascade,
    quantity integer not null default 0 check (quantity >= 0),
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(cooperator_id, product_id)
);

-- Orders table
create table if not exists public.orders (
    id uuid primary key default uuid_generate_v4(),
    order_code text unique not null,
    cooperator_id uuid not null references public.users(id) on delete restrict,
    branch_id uuid not null references public.branches(id) on delete restrict,
    status order_status not null default 'requested',
    total_items integer not null default 0,
    total_amount numeric(12, 2) not null default 0.00,
    notes text,
    created_by uuid references public.users(id) on delete set null,
    approved_by uuid references public.users(id) on delete set null,
    approved_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order Items table
create table if not exists public.order_items (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid not null references public.orders(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete restrict,
    qty_requested integer not null check (qty_requested > 0),
    qty_confirmed integer check (qty_confirmed >= 0),
    unit_price numeric(12, 2) not null default 0.00,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Delivery Routes table
create table if not exists public.routes (
    id uuid primary key default uuid_generate_v4(),
    route_code text unique not null,
    branch_id uuid not null references public.branches(id) on delete cascade,
    driver_id uuid references public.users(id) on delete set null,
    date date not null default current_date,
    status route_status not null default 'draft',
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Route Stops table
create table if not exists public.route_stops (
    id uuid primary key default uuid_generate_v4(),
    route_id uuid not null references public.routes(id) on delete cascade,
    order_id uuid not null references public.orders(id) on delete cascade,
    sequence integer not null default 1,
    estimated_arrival timestamp with time zone,
    completed_at timestamp with time zone,
    status text default 'pending', -- pending, in_progress, completed, skipped
    unique(route_id, sequence)
);

-- Deliveries & Proof table (§4.4 per-stop proof)
create table if not exists public.deliveries (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid not null unique references public.orders(id) on delete cascade,
    driver_id uuid references public.users(id) on delete set null,
    status delivery_status not null default 'pending',
    picked_up_at timestamp with time zone,
    delivered_at timestamp with time zone,
    proof_photo_url text,
    signature_url text,
    recipient_name text,
    delivered_qty jsonb default '{}'::jsonb, -- map of product_id -> qty
    is_auto_confirmed boolean default false,
    auto_confirm_deadline timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Disputes table (§3.7, §4.1)
create table if not exists public.disputes (
    id uuid primary key default uuid_generate_v4(),
    delivery_id uuid not null references public.deliveries(id) on delete cascade,
    order_item_id uuid not null references public.order_items(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete restrict,
    qty_expected integer not null,
    qty_received integer not null,
    reason text not null,
    evidence_photo_url text,
    status dispute_status not null default 'open',
    resolved_by uuid references public.users(id) on delete set null,
    resolved_at timestamp with time zone,
    resolution_notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- System Settings table (Configurable auto-confirm window §4.1)
create table if not exists public.settings (
    id uuid primary key default uuid_generate_v4(),
    branch_id uuid unique references public.branches(id) on delete cascade, -- null for global defaults
    auto_confirm_hours integer not null default 24,
    allow_partial_delivery boolean default true,
    require_signature boolean default true,
    require_photo boolean default true,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Audit Log table (§1, §4.2, §7)
create table if not exists public.audit_log (
    id uuid primary key default uuid_generate_v4(),
    actor_id uuid references public.users(id) on delete set null,
    action text not null, -- INSERT, UPDATE, DELETE, OVERRIDE, APPROVE, RESOLVE
    entity text not null, -- orders, branch_stock, products, disputes, users
    entity_id text not null,
    branch_id uuid references public.branches(id) on delete set null,
    before jsonb,
    after jsonb,
    ip_address text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 3. BUSINESS LOGIC STORED PROCEDURES & TRIGGERS
-- ---------------------------------------------------------------------

-- Function: Soft-reserve stock on Order Approval (§4.3)
create or replace function public.handle_order_approval()
returns trigger as $$
declare
    item record;
    curr_on_hand integer;
    curr_reserved integer;
begin
    -- Triggered when status changes to 'approved'
    if (new.status = 'approved' and old.status != 'approved') then
        for item in select product_id, qty_requested from public.order_items where order_id = new.id loop
            -- Check stock
            select on_hand_quantity, reserved_quantity 
            into curr_on_hand, curr_reserved 
            from public.branch_stock 
            where branch_id = new.branch_id and product_id = item.product_id;

            if not found or (curr_on_hand - curr_reserved) < item.qty_requested then
                raise exception 'Insufficient available stock for product % in branch %', item.product_id, new.branch_id;
            end if;

            -- Soft lock reserved quantity
            update public.branch_stock
            set reserved_quantity = reserved_quantity + item.qty_requested,
                updated_at = timezone('utc'::text, now())
            where branch_id = new.branch_id and product_id = item.product_id;
        end loop;
        
        new.approved_at = timezone('utc'::text, now());
    end if;

    -- Triggered when status changes to 'picked_up' -> Physically decrement on_hand & clear reservation (§4.3)
    if (new.status = 'picked_up' and old.status != 'picked_up') then
        for item in select product_id, qty_requested from public.order_items where order_id = new.id loop
            update public.branch_stock
            set on_hand_quantity = on_hand_quantity - item.qty_requested,
                reserved_quantity = greatest(0, reserved_quantity - item.qty_requested),
                updated_at = timezone('utc'::text, now())
            where branch_id = new.branch_id and product_id = item.product_id;
        end loop;
    end if;

    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_order_approval on public.orders;
create trigger trg_order_approval
before update of status on public.orders
for each row execute function public.handle_order_approval();


-- Function: Increment Cooperator Stock on Confirmation (§3.7)
create or replace function public.handle_order_confirmation()
returns trigger as $$
declare
    item record;
begin
    if (new.status = 'confirmed' and old.status != 'confirmed') then
        for item in select product_id, coalesce(qty_confirmed, qty_requested) as final_qty 
                    from public.order_items where order_id = new.id loop
            insert into public.cooperator_stock (cooperator_id, product_id, quantity, updated_at)
            values (new.cooperator_id, item.product_id, item.final_qty, timezone('utc'::text, now()))
            on conflict (cooperator_id, product_id) 
            do update set quantity = public.cooperator_stock.quantity + excluded.quantity,
                          updated_at = timezone('utc'::text, now());
        end loop;
    end if;
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_order_confirmation on public.orders;
create trigger trg_order_confirmation
after update of status on public.orders
for each row execute function public.handle_order_confirmation();


-- ---------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES (§1, §4.5, §4.6)
-- ---------------------------------------------------------------------

alter table public.branches enable row level security;
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.branch_stock enable row level security;
alter table public.cooperator_stock enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.routes enable row level security;
alter table public.route_stops enable row level security;
alter table public.deliveries enable row level security;
alter table public.disputes enable row level security;
alter table public.audit_log enable row level security;
alter table public.settings enable row level security;

-- Helper function to get current user role
create or replace function public.get_auth_role()
returns user_role as $$
    select role from public.users where id = auth.uid();
$$ language sql stable security definer;

-- Helper function to get current user branch_id
create or replace function public.get_auth_branch()
returns uuid as $$
    select branch_id from public.users where id = auth.uid();
$$ language sql stable security definer;

-- Products Policies:
create policy "Anyone authenticated can view active products" 
    on public.products for select using (auth.role() = 'authenticated' and is_active = true);

create policy "Admin can manage products" 
    on public.products for all using (public.get_auth_role() = 'admin');

-- Orders Policies:
create policy "Admin has full access to orders" 
    on public.orders for all using (public.get_auth_role() = 'admin');

create policy "Managers view/manage their branch orders" 
    on public.orders for all using (
        public.get_auth_role() = 'manager' and branch_id = public.get_auth_branch()
    );

create policy "Cooperators view and create their own orders" 
    on public.orders for select using (
        public.get_auth_role() = 'cooperator' and cooperator_id = auth.uid()
    );

create policy "Cooperators insert their own orders" 
    on public.orders for insert with check (
        public.get_auth_role() = 'cooperator' and cooperator_id = auth.uid()
    );

create policy "Drivers view assigned orders" 
    on public.orders for select using (
        public.get_auth_role() = 'driver' and id in (
            select order_id from public.route_stops rs 
            join public.routes r on rs.route_id = r.id 
            where r.driver_id = auth.uid()
        )
    );

-- Cooperator Stock Isolation (§4.5):
create policy "Cooperators can only see their own stock" 
    on public.cooperator_stock for select using (
        cooperator_id = auth.uid()
    );

create policy "Admin and branch manager can view cooperator stock" 
    on public.cooperator_stock for select using (
        public.get_auth_role() in ('admin', 'manager')
    );

-- Branch Stock Policies:
create policy "Admin and Managers view branch stock" 
    on public.branch_stock for select using (
        public.get_auth_role() = 'admin' or 
        (public.get_auth_role() = 'manager' and branch_id = public.get_auth_branch())
    );

-- Disputes Policies:
create policy "Cooperators view and create their disputes" 
    on public.disputes for all using (
        public.get_auth_role() = 'cooperator' and delivery_id in (
            select id from public.deliveries d 
            join public.orders o on d.order_id = o.id 
            where o.cooperator_id = auth.uid()
        )
    );

create policy "Managers view and resolve disputes in their branch" 
    on public.disputes for all using (
        public.get_auth_role() = 'manager' and delivery_id in (
            select d.id from public.deliveries d 
            join public.orders o on d.order_id = o.id 
            where o.branch_id = public.get_auth_branch()
        )
    );

create policy "Admin full dispute access" 
    on public.disputes for all using (public.get_auth_role() = 'admin');

-- Audit Log Policies (§1: Only Admin can view all, hard-delete):
create policy "Admin view audit logs" 
    on public.audit_log for select using (public.get_auth_role() = 'admin');

create policy "System and users insert audit logs" 
    on public.audit_log for insert with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------
-- 5. INITIAL SEED DATA
-- ---------------------------------------------------------------------
insert into public.branches (id, name, code, address, phone)
values 
    ('11111111-1111-1111-1111-111111111111', 'Phnom Penh Central Hub', 'PP-01', 'Street 271, Mean Chey, Phnom Penh', '+855 23 888 111'),
    ('22222222-2222-2222-2222-222222222222', 'Siem Reap Express Depot', 'SR-01', 'National Road 6, Svay Dangkum, Siem Reap', '+855 63 999 222'),
    ('33333333-3333-3333-3333-333333333333', 'Battambang Regional Branch', 'BTB-01', 'La He Street, Battambang', '+855 53 777 333')
on conflict (code) do nothing;

insert into public.products (id, name, sku, unit, category, default_price, min_stock_alert, image_url)
values 
    -- 1. Functional / Performance Fabrics
    ('tst-fab-mw01', 'Moisture Wicking / Quick Dry Performance Fabric (ក្រណាត់ស្រូប និងបញ្ចេញញើសលឿន)', 'TST-FAB-MW01', 'Roll (50m)', 'Functional Performance Fabrics (ក្រណាត់មុខងារពិសេស)', 185.00, 15, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80'),
    ('tst-fab-uv02', 'Anti-UV Sun Protection Sports Fabric (ក្រណាត់ការពារកម្តៅថ្ងៃ UPF 50+)', 'TST-FAB-UV02', 'Roll (50m)', 'Functional Performance Fabrics (ក្រណាត់មុខងារពិសេស)', 195.00, 12, 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=600&q=80'),
    ('tst-fab-ab03', 'Anti-Bacterial & Anti-Odor Fabric (ក្រណាត់ប្រឆាំងក្លិនផ្អួរ និងបាក់តេរី)', 'TST-FAB-AB03', 'Roll (50m)', 'Functional Performance Fabrics (ក្រណាត់មុខងារពិសេស)', 210.00, 10, 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=600&q=80'),
    
    -- 2. Knitted Fabrics
    ('tst-knt-sj04', 'Single Jersey Performance Knit (ក្រណាត់ Single Jersey ស្តើងរលោងទន់)', 'TST-KNT-SJ04', 'Roll (50m)', 'Knitted Fabrics (ក្រណាត់ត្បាញយឺត)', 140.00, 25, 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80'),
    ('tst-knt-dj05', 'Double Jersey Heavy Knit (ក្រណាត់ Double Jersey ត្បាញយឺតភ្លោះ)', 'TST-KNT-DJ05', 'Roll (50m)', 'Knitted Fabrics (ក្រណាត់ត្បាញយឺត)', 165.00, 20, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80'),
    ('tst-knt-in06', 'Interlock Smooth Double-Face (ក្រណាត់ Interlock ក្រាស់មាំរលោងសងខាង)', 'TST-KNT-IN06', 'Roll (50m)', 'Knitted Fabrics (ក្រណាត់ត្បាញយឺត)', 175.00, 18, 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=600&q=80'),
    ('tst-knt-rb07', 'Rib Fabric Elastic Trims (ក្រណាត់យឺតឆ្នូតៗ Rib សម្រាប់កអាវ/ដៃអាវ)', 'TST-KNT-RB07', 'Roll (30m)', 'Knitted Fabrics (ក្រណាត់ត្បាញយឺត)', 110.00, 15, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80'),
    ('tst-knt-ms08', 'Piqué & Mesh Breathable Knit (ក្រណាត់ Piqué & Mesh ប្រហោងខ្យល់បញ្ចេញកម្ដៅ)', 'TST-KNT-MS08', 'Roll (50m)', 'Knitted Fabrics (ក្រណាត់ត្បាញយឺត)', 155.00, 20, 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&w=600&q=80'),
    ('tst-knt-ft09', 'French Terry & Fleece Fabric (ក្រណាត់ French Terry & Fleece សាច់ក្រាស់រោមទន់)', 'TST-KNT-FT09', 'Roll (40m)', 'Knitted Fabrics (ក្រណាត់ត្បាញយឺត)', 190.00, 15, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80'),
    
    -- 3. Spandex / Elastane Blends
    ('tst-spx-ps10', '4-Way Stretch Poly-Spandex Blend (ក្រណាត់ Polyester-Spandex 4-Way Stretch)', 'TST-SPX-PS10', 'Roll (50m)', 'Spandex & Elastane Blends (ក្រណាត់អេឡាស្ទីន)', 220.00, 20, 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80'),
    ('tst-spx-ns11', '4-Way Stretch Nylon-Spandex Blend (ក្រណាត់ Nylon-Spandex 4-Way Stretch)', 'TST-SPX-NS11', 'Roll (50m)', 'Spandex & Elastane Blends (ក្រណាត់អេឡាស្ទីន)', 245.00, 15, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80'),
    ('tst-spx-cs12', '4-Way Stretch Cotton-Spandex Blend (ក្រណាត់ Cotton-Spandex 4-Way Stretch)', 'TST-SPX-CS12', 'Roll (50m)', 'Spandex & Elastane Blends (ក្រណាត់អេឡាស្ទីន)', 195.00, 18, 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'),

    -- 4. Activewear & Training Tops
    ('tst-gar-rn13', 'Performance Running Tees (អាវយឺតរត់ប្រណាំងកម្រិតខ្ពស់)', 'TST-GAR-RN13', 'Carton (100 pcs)', 'Activewear & Training Tops (អាវកីឡា និងអាវហ្វឹកហាត់)', 650.00, 10, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'),
    ('tst-gar-fb14', 'Pro Football / Soccer Team Jerseys (អាវកីឡាបាល់ទាត់អាជីព)', 'TST-GAR-FB14', 'Carton (100 pcs)', 'Activewear & Training Tops (អាវកីឡា និងអាវហ្វឹកហាត់)', 750.00, 10, 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=600&q=80'),
    ('tst-gar-bb15', 'Athletic Basketball Jerseys (អាវកីឡាបាល់បោះ)', 'TST-GAR-BB15', 'Carton (100 pcs)', 'Activewear & Training Tops (អាវកីឡា និងអាវហ្វឹកហាត់)', 720.00, 10, 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80'),
    ('tst-gar-pl16', 'Performance Sports Polo Shirts (អាវប៉ូឡូកីឡា)', 'TST-GAR-PL16', 'Carton (100 pcs)', 'Activewear & Training Tops (អាវកីឡា និងអាវហ្វឹកហាត់)', 850.00, 8, 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80'),

    -- 5. Sport Bottoms
    ('tst-gar-lg17', 'High-Performance Compression Leggings (ខោហាត់ប្រាណយឺតរឹបរាង)', 'TST-GAR-LG17', 'Carton (100 pcs)', 'Sport Bottoms (ខោកីឡា)', 890.00, 12, 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=600&q=80'),
    ('tst-gar-sh18', 'Athletic Performance Shorts (ខោខ្លីកីឡា)', 'TST-GAR-SH18', 'Carton (100 pcs)', 'Sport Bottoms (ខោកីឡា)', 620.00, 15, 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80'),
    ('tst-gar-jg19', 'Warm-Up Joggers & Track Pants (ខោកម្ដៅសាច់ដុំ)', 'TST-GAR-JG19', 'Carton (100 pcs)', 'Sport Bottoms (ខោកីឡា)', 790.00, 10, 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=600&q=80'),

    -- 6. Outerwear
    ('tst-gar-ls20', 'Long-Sleeve Thermal Compression Tops (អាវរងាដៃវែងកីឡា)', 'TST-GAR-LS20', 'Carton (80 pcs)', 'Outerwear (អាវក្រៅកីឡា)', 680.00, 10, 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=600&q=80'),
    ('tst-gar-hd21', 'Performance Sports Hoodies (អាវ Hoodie កីឡា)', 'TST-GAR-HD21', 'Carton (60 pcs)', 'Outerwear (អាវក្រៅកីឡា)', 840.00, 10, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80'),
    ('tst-gar-jk22', 'Athletic Tracksuit Warm-Up Jackets (អាវ Tracksuit Jackets កម្ដៅសាច់ដុំ)', 'TST-GAR-JK22', 'Carton (60 pcs)', 'Outerwear (អាវក្រៅកីឡា)', 920.00, 8, 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80')
on conflict (sku) do update set 
    name = excluded.name,
    category = excluded.category,
    unit = excluded.unit,
    default_price = excluded.default_price,
    min_stock_alert = excluded.min_stock_alert,
    image_url = excluded.image_url;
