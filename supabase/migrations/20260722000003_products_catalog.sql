-- ============================================================
-- Voleak Express - Products Catalog Supabase Table Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Textiles',
    unit_weight TEXT NOT NULL DEFAULT '24.5 Tons',
    stock_at_hub TEXT NOT NULL DEFAULT 'In Stock',
    status TEXT NOT NULL DEFAULT 'in_stock',
    image_url TEXT,
    corporate_id TEXT DEFAULT 'demo-corporate-id',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & Public Access Policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to products"
    ON public.products FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert and update to products"
    ON public.products FOR ALL
    USING (true);

-- Seed Initial Corporate Products
INSERT INTO public.products (sku, name, category, unit_weight, stock_at_hub, status, image_url, corporate_id) VALUES
('TST-FAB-001', 'Spandex Textile Fabric Rolls', 'Textiles & Knits', '24.5 Tons / Container', '42 Rolls (2,100m)', 'in_stock', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&q=80', 'demo-corporate-id'),
('TST-YRN-002', 'Activewear Polyester Yarns', 'Raw Yarn Material', '18.0 Tons / Truck', '28 Pallets', 'in_stock', 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=300&q=80', 'demo-corporate-id'),
('TST-CHM-003', 'Dye Chemical Drum Containers', 'Industrial Chemicals', '12.5 Tons / Shipment', '15 Drums', 'low_stock', 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=300&q=80', 'demo-corporate-id'),
('TST-EQP-004', 'Precision Sewing Machinery & Parts', 'Factory Equipment', '8.2 Tons / Crate', '6 Crates', 'in_stock', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80', 'demo-corporate-id')
ON CONFLICT (sku) DO NOTHING;
