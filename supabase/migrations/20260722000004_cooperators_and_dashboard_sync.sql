-- ============================================================
-- Voleak Express - Cooperators, Products & Logistics Data Schema
-- ============================================================

-- 1. Create Cooperators Table (Corporate Clients)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Cooperators Table (Corporate Clients & Partner Factories)
CREATE TABLE IF NOT EXISTS public.cooperators (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    factory_name TEXT,
    short_name TEXT,
    code TEXT UNIQUE,
    industry TEXT DEFAULT 'Garments & Textiles',
    category TEXT DEFAULT 'Garment & Apparel Manufacturing',
    tier TEXT DEFAULT 'VIP Platinum Partner',
    discount_rate TEXT DEFAULT '15% Corporate Off',
    payment_terms TEXT DEFAULT 'Net 30 Days',
    credit_limit NUMERIC DEFAULT 50000.0,
    current_balance NUMERIC DEFAULT 12400.0,
    contact_person TEXT,
    contact_title TEXT,
    phone TEXT,
    email TEXT,
    tax_id TEXT,
    province TEXT DEFAULT 'Phnom Penh',
    address TEXT,
    latitude NUMERIC DEFAULT 11.5564,
    longitude NUMERIC DEFAULT 104.9282,
    operator_id TEXT DEFAULT 'hub-pp-01',
    hub_name TEXT DEFAULT 'Phnom Penh Central Freight Hub',
    primary_corridor TEXT DEFAULT 'Phnom Penh Central Hub ⇄ Sihanoukville Port Deep Sea Terminal',
    logo_url TEXT,
    rating NUMERIC DEFAULT 5.0,
    total_waybills INT DEFAULT 148,
    total_tonnage NUMERIC DEFAULT 420.5,
    total_spend NUMERIC DEFAULT 58200.0,
    cod_collected NUMERIC DEFAULT 18500.0,
    joined_date TEXT DEFAULT '2026-01-15',
    notes TEXT,
    status TEXT DEFAULT 'active',
    active_shipments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and public access
ALTER TABLE public.cooperators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to cooperators" ON public.cooperators;
CREATE POLICY "Allow public read access to cooperators"
    ON public.cooperators FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access to cooperators" ON public.cooperators;
CREATE POLICY "Allow public insert access to cooperators"
    ON public.cooperators FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access to cooperators" ON public.cooperators;
CREATE POLICY "Allow public update access to cooperators"
    ON public.cooperators FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete access to cooperators" ON public.cooperators;
CREATE POLICY "Allow public delete access to cooperators"
    ON public.cooperators FOR DELETE USING (true);

-- Seed Default Cooperators (Top Sports Textile / Manhattan Garments & Crystal Garments)
INSERT INTO public.cooperators (
    id, name, factory_name, short_name, code, industry, category, tier, discount_rate, payment_terms,
    credit_limit, current_balance, contact_person, contact_title, phone, email, tax_id, province, address,
    latitude, longitude, operator_id, hub_name, primary_corridor, logo_url, rating, total_waybills,
    total_tonnage, total_spend, cod_collected, joined_date, notes, status, active_shipments
) VALUES (
    '55555555-5555-5555-5555-555555555555',
    'Top Sports Textile (TST Group)',
    'Manhattan Textile Mills Ltd',
    'Manhattan Garments',
    'COP-MANHATTAN-01',
    'Garments & Textiles',
    'Garment & Apparel Manufacturing',
    'VIP Platinum Partner',
    '15% Corporate Off',
    'Net 30 Days',
    50000.0,
    12400.0,
    'Mr. Kenji Takahashi',
    'Procurement & Supply Chain Director',
    '+855 23 881 200',
    'procurement@manhattanmills.kh',
    'K002-98471203',
    'Phnom Penh',
    'Phnom Penh Special Economic Zone (PPSEZ), National Road 4',
    11.5564,
    104.9282,
    'hub-pp-01',
    'Phnom Penh Central Freight Hub',
    'Phnom Penh Central Hub ⇄ Sihanoukville Port Deep Sea Terminal',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&q=80',
    5.0,
    148,
    420.5,
    58200.0,
    18500.0,
    '2026-01-15',
    'Primary PPSEZ partner with dedicated 40ft container dispatch direct to Sihanoukville Port Deep Sea Terminal.',
    'active',
    '[{"id":"VKX-WAY-1092","destination":"Sihanoukville Port Deep Sea Terminal","tonnage":"24.5 Tons","fee":420,"status":"In Transit"},{"id":"VKX-WAY-1094","destination":"Bavet Border Special Economic Zone Depot","tonnage":"18.0 Tons","fee":310,"status":"Delivered"}]'::jsonb
), (
    'cop-2',
    'Crystal Garment International Ltd',
    'Crystal Garment International Ltd',
    'Crystal Garments',
    'COP-CRYSTAL-02',
    'Garments & Textiles',
    'Activewear Export Partner',
    'Gold Partner',
    '10% Off',
    'Net 30 Days',
    35000.0,
    8200.0,
    'Ms. Lin Mei-Hua',
    'Export Logistics Head',
    '+855 34 934 888',
    'shipping@crystalgarments.kh',
    'K003-81927344',
    'Preah Sihanouk',
    'Port Maritime Zone 3, Sihanoukville Port SEZ Industrial Park',
    10.6253,
    103.5234,
    'hub-shv-02',
    'Sihanoukville Autonomous Port Deep Sea Terminal',
    'Phnom Penh Central Hub ⇄ Sihanoukville Port Deep Sea Terminal',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=300&q=80',
    4.9,
    96,
    310.0,
    41500.0,
    12300.0,
    '2026-02-10',
    'Deep-sea maritime terminal staging for international container export vessels and textile raw material intake.',
    'active',
    '[{"id":"VKX-WAY-2041","destination":"Phnom Penh Central Freight Hub","tonnage":"16.5 Tons","fee":380,"status":"Scheduled"}]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    factory_name = EXCLUDED.factory_name,
    short_name = EXCLUDED.short_name,
    contact_person = EXCLUDED.contact_person,
    phone = EXCLUDED.phone,
    logo_url = EXCLUDED.logo_url;

-- 2. Create Products Table (Catalog)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Textiles',
    unit_weight TEXT DEFAULT '24.5 Tons',
    stock_at_hub TEXT DEFAULT 'In Stock',
    status TEXT DEFAULT 'in_stock',
    image_url TEXT,
    corporate_id TEXT DEFAULT '55555555-5555-5555-5555-555555555555',
    default_price NUMERIC DEFAULT 0.0,
    min_stock_alert INT DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products"
    ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public full access to products" ON public.products;
CREATE POLICY "Allow public full access to products"
    ON public.products FOR ALL USING (true);

-- Seed Initial Products
INSERT INTO public.products (id, sku, name, category, unit_weight, stock_at_hub, status, image_url, corporate_id, default_price) VALUES
('tst-fab-001', 'TST-FAB-001', 'Spandex Textile Fabric Rolls', 'Textiles & Knits', '24.5 Tons / Container', '42 Rolls (2,100m)', 'in_stock', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&q=80', '55555555-5555-5555-5555-555555555555', 185.00),
('tst-yrn-002', 'TST-YRN-002', 'Activewear Polyester Yarns', 'Raw Yarn Material', '18.0 Tons / Truck', '28 Pallets', 'in_stock', 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=300&q=80', '55555555-5555-5555-5555-555555555555', 195.00),
('tst-chm-003', 'TST-CHM-003', 'Dye Chemical Drum Containers', 'Industrial Chemicals', '12.5 Tons / Shipment', '15 Drums', 'low_stock', 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=300&q=80', '55555555-5555-5555-5555-555555555555', 210.00),
('tst-eqp-004', 'TST-EQP-004', 'Precision Sewing Machinery & Parts', 'Factory Equipment', '8.2 Tons / Crate', '6 Crates', 'in_stock', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80', '55555555-5555-5555-5555-555555555555', 650.00)
ON CONFLICT (id) DO NOTHING;
