-- =====================================================================
-- TOP SPORTS TEXTILE (TST GROUP) PRODUCT CATALOG MIGRATION
-- Single Source of Truth for Functional Performance Fabrics & Sportswear
-- =====================================================================

-- 1. Ensure columns exist on products table
alter table if exists public.products add column if not exists cost_price numeric(12, 2) default 0.00;
alter table if exists public.products add column if not exists barcode text;
alter table if exists public.products add column if not exists warehouse_location text;
alter table if exists public.products add column if not exists description text;

-- 2. Clear out old beverage/staple test records if desired
delete from public.order_items where product_id in (select id from public.products where sku like 'VE-%');
delete from public.branch_stock where product_id in (select id from public.products where sku like 'VE-%');
delete from public.cooperator_stock where product_id in (select id from public.products where sku like 'VE-%');
delete from public.products where sku like 'VE-%';

-- 3. Upsert Top Sports Textile Products
insert into public.products (id, name, sku, barcode, unit, category, default_price, min_stock_alert, image_url, is_active)
values
    -- 1. Functional Performance Fabrics (ក្រណាត់មុខងារពិសេស)
    ('tst-fab-mw01', 'Moisture Wicking / Quick Dry Performance Fabric (ក្រណាត់ស្រូប និងបញ្ចេញញើសលឿន)', 'TST-FAB-MW01', '884102938101', 'Roll (50m)', 'Functional Performance Fabrics (ក្រណាត់មុខងារពិសេស)', 185.00, 15, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80', true),
    ('tst-fab-uv02', 'Anti-UV Sun Protection Sports Fabric (ក្រណាត់ការពារកម្តៅថ្ងៃ UPF 50+)', 'TST-FAB-UV02', '884102938102', 'Roll (50m)', 'Functional Performance Fabrics (ក្រណាត់មុខងារពិសេស)', 195.00, 12, 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=600&q=80', true),
    ('tst-fab-ab03', 'Anti-Bacterial & Anti-Odor Fabric (ក្រណាត់ប្រឆាំងក្លិនផ្អួរ និងបាក់តេរី)', 'TST-FAB-AB03', '884102938103', 'Roll (50m)', 'Functional Performance Fabrics (ក្រណាត់មុខងារពិសេស)', 210.00, 10, 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=600&q=80', true),

    -- 2. Knitted Fabrics (ក្រណាត់ត្បាញយឺត)
    ('tst-knt-sj04', 'Single Jersey Performance Knit (ក្រណាត់ Single Jersey ស្តើងរលោងទន់)', 'TST-KNT-SJ04', '884102938104', 'Roll (50m)', 'Knitted Fabrics (ក្រណាត់ត្បាញយឺត)', 140.00, 25, 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80', true),
    ('tst-knt-dj05', 'Double Jersey Heavy Knit (ក្រណាត់ Double Jersey ត្បាញយឺតភ្លោះ)', 'TST-KNT-DJ05', '884102938105', 'Roll (50m)', 'Knitted Fabrics (ក្រណាត់ត្បាញយឺត)', 165.00, 20, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80', true),
    ('tst-knt-in06', 'Interlock Smooth Double-Face (ក្រណាត់ Interlock ក្រាស់មាំរលោងសងខាង)', 'TST-KNT-IN06', '884102938106', 'Roll (50m)', 'Knitted Fabrics (ក្រណាត់ត្បាញយឺត)', 175.00, 18, 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=600&q=80', true),
    ('tst-knt-rb07', 'Rib Fabric Elastic Trims (ក្រណាត់យឺតឆ្នូតៗ Rib សម្រាប់កអាវ/ដៃអាវ)', 'TST-KNT-RB07', '884102938107', 'Roll (30m)', 'Knitted Fabrics (ក្រណាត់ត្បាញយឺត)', 110.00, 15, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80', true),
    ('tst-knt-ms08', 'Piqué & Mesh Breathable Knit (ក្រណាត់ Piqué & Mesh ប្រហោងខ្យល់បញ្ចេញកម្ដៅ)', 'TST-KNT-MS08', '884102938108', 'Roll (50m)', 'Knitted Fabrics (ក្រណាត់ត្បាញយឺត)', 155.00, 20, 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&w=600&q=80', true),
    ('tst-knt-ft09', 'French Terry & Fleece Fabric (ក្រណាត់ French Terry & Fleece សាច់ក្រាស់រោមទន់)', 'TST-KNT-FT09', '884102938109', 'Roll (40m)', 'Knitted Fabrics (ក្រណាត់ត្បាញយឺត)', 190.00, 15, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80', true),

    -- 3. Spandex / Elastane Blends (ក្រណាត់អេឡាស្ទីន)
    ('tst-spx-ps10', '4-Way Stretch Poly-Spandex Blend (ក្រណាត់ Polyester-Spandex 4-Way Stretch)', 'TST-SPX-PS10', '884102938110', 'Roll (50m)', 'Spandex & Elastane Blends (ក្រណាត់អេឡាស្ទីន)', 220.00, 20, 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80', true),
    ('tst-spx-ns11', '4-Way Stretch Nylon-Spandex Blend (ក្រណាត់ Nylon-Spandex 4-Way Stretch)', 'TST-SPX-NS11', '884102938111', 'Roll (50m)', 'Spandex & Elastane Blends (ក្រណាត់អេឡាស្ទីន)', 245.00, 15, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80', true),
    ('tst-spx-cs12', '4-Way Stretch Cotton-Spandex Blend (ក្រណាត់ Cotton-Spandex 4-Way Stretch)', 'TST-SPX-CS12', '884102938112', 'Roll (50m)', 'Spandex & Elastane Blends (ក្រណាត់អេឡាស្ទីន)', 195.00, 18, 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80', true),

    -- 4. Activewear & Training Tops (អាវកីឡា និងអាវហ្វឹកហាត់)
    ('tst-gar-rn13', 'Performance Running Tees (អាវយឺតរត់ប្រណាំងកម្រិតខ្ពស់)', 'TST-GAR-RN13', '884102938113', 'Carton (100 pcs)', 'Activewear & Training Tops (អាវកីឡា និងអាវហ្វឹកហាត់)', 650.00, 10, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80', true),
    ('tst-gar-fb14', 'Pro Football / Soccer Team Jerseys (អាវកីឡាបាល់ទាត់អាជីព)', 'TST-GAR-FB14', '884102938114', 'Carton (100 pcs)', 'Activewear & Training Tops (អាវកីឡា និងអាវហ្វឹកហាត់)', 750.00, 10, 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=600&q=80', true),
    ('tst-gar-bb15', 'Athletic Basketball Jerseys (អាវកីឡាបាល់បោះ)', 'TST-GAR-BB15', '884102938115', 'Carton (100 pcs)', 'Activewear & Training Tops (អាវកីឡា និងអាវហ្វឹកហាត់)', 720.00, 10, 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80', true),
    ('tst-gar-pl16', 'Performance Sports Polo Shirts (អាវប៉ូឡូកីឡា)', 'TST-GAR-PL16', '884102938116', 'Carton (100 pcs)', 'Activewear & Training Tops (អាវកីឡា និងអាវហ្វឹកហាត់)', 850.00, 8, 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80', true),

    -- 5. Sport Bottoms (ខោកីឡា)
    ('tst-gar-lg17', 'High-Performance Compression Leggings (ខោហាត់ប្រាណយឺតរឹបរាង)', 'TST-GAR-LG17', '884102938117', 'Carton (100 pcs)', 'Sport Bottoms (ខោកីឡា)', 890.00, 12, 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=600&q=80', true),
    ('tst-gar-sh18', 'Athletic Performance Shorts (ខោខ្លីកីឡា)', 'TST-GAR-SH18', '884102938118', 'Carton (100 pcs)', 'Sport Bottoms (ខោកីឡា)', 620.00, 15, 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80', true),
    ('tst-gar-jg19', 'Warm-Up Joggers & Track Pants (ខោកម្ដៅសាច់ដុំ)', 'TST-GAR-JG19', '884102938119', 'Carton (100 pcs)', 'Sport Bottoms (ខោកីឡា)', 790.00, 10, 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=600&q=80', true),

    -- 6. Outerwear (អាវក្រៅកីឡា)
    ('tst-gar-ls20', 'Long-Sleeve Thermal Compression Tops (អាវរងាដៃវែងកីឡា)', 'TST-GAR-LS20', '884102938120', 'Carton (80 pcs)', 'Outerwear (អាវក្រៅកីឡា)', 680.00, 10, 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=600&q=80', true),
    ('tst-gar-hd21', 'Performance Sports Hoodies (អាវ Hoodie កីឡា)', 'TST-GAR-HD21', '884102938121', 'Carton (60 pcs)', 'Outerwear (អាវក្រៅកីឡា)', 840.00, 10, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80', true),
    ('tst-gar-jk22', 'Athletic Tracksuit Warm-Up Jackets (អាវ Tracksuit Jackets កម្ដៅសាច់ដុំ)', 'TST-GAR-JK22', '884102938122', 'Carton (60 pcs)', 'Outerwear (អាវក្រៅកីឡា)', 920.00, 8, 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80', true)
on conflict (sku) do update set 
    name = excluded.name,
    barcode = excluded.barcode,
    unit = excluded.unit,
    category = excluded.category,
    default_price = excluded.default_price,
    min_stock_alert = excluded.min_stock_alert,
    image_url = excluded.image_url,
    is_active = excluded.is_active;

-- 4. Initial Branch Stock Inventory for Hubs
insert into public.branch_stock (id, branch_id, product_id, on_hand_quantity, reserved_quantity, warehouse_location, updated_at)
values
    -- Phnom Penh Central Freight Hub (PP-01 / op-1)
    ('bs-1', '11111111-1111-1111-1111-111111111111', 'tst-fab-mw01', 120, 25, 'Fabric Bay A-1 (Textile Warehouse)', now()),
    ('bs-2', '11111111-1111-1111-1111-111111111111', 'tst-fab-uv02', 85, 15, 'Fabric Bay A-2 (Textile Warehouse)', now()),
    ('bs-3', '11111111-1111-1111-1111-111111111111', 'tst-fab-ab03', 65, 10, 'Fabric Bay A-3 (Textile Warehouse)', now()),
    ('bs-4', '11111111-1111-1111-1111-111111111111', 'tst-knt-sj04', 150, 35, 'Knit Storage Bay B-1', now()),
    ('bs-5', '11111111-1111-1111-1111-111111111111', 'tst-knt-dj05', 110, 20, 'Knit Storage Bay B-2', now()),
    ('bs-6', '11111111-1111-1111-1111-111111111111', 'tst-knt-in06', 95, 18, 'Knit Storage Bay B-3', now()),
    ('bs-7', '11111111-1111-1111-1111-111111111111', 'tst-knt-rb07', 75, 12, 'Trims Bay B-4', now()),
    ('bs-8', '11111111-1111-1111-1111-111111111111', 'tst-knt-ms08', 130, 30, 'Mesh Bay B-5', now()),
    ('bs-9', '11111111-1111-1111-1111-111111111111', 'tst-knt-ft09', 80, 15, 'Fleece Bay B-6', now()),
    ('bs-10', '11111111-1111-1111-1111-111111111111', 'tst-spx-ps10', 140, 40, 'Spandex Bay C-1', now()),
    ('bs-11', '11111111-1111-1111-1111-111111111111', 'tst-spx-ns11', 105, 25, 'Spandex Bay C-2', now()),
    ('bs-12', '11111111-1111-1111-1111-111111111111', 'tst-spx-cs12', 90, 15, 'Spandex Bay C-3', now()),
    ('bs-13', '11111111-1111-1111-1111-111111111111', 'tst-gar-rn13', 60, 10, 'Finished Goods Bay D-1', now()),
    ('bs-14', '11111111-1111-1111-1111-111111111111', 'tst-gar-fb14', 55, 12, 'Finished Goods Bay D-2', now()),
    ('bs-15', '11111111-1111-1111-1111-111111111111', 'tst-gar-bb15', 40, 8, 'Finished Goods Bay D-3', now()),
    ('bs-16', '11111111-1111-1111-1111-111111111111', 'tst-gar-pl16', 45, 6, 'Finished Goods Bay D-4', now()),
    ('bs-17', '11111111-1111-1111-1111-111111111111', 'tst-gar-lg17', 70, 18, 'Finished Goods Bay E-1', now()),
    ('bs-18', '11111111-1111-1111-1111-111111111111', 'tst-gar-sh18', 85, 20, 'Finished Goods Bay E-2', now()),
    ('bs-19', '11111111-1111-1111-1111-111111111111', 'tst-gar-jg19', 50, 10, 'Finished Goods Bay E-3', now()),
    ('bs-20', '11111111-1111-1111-1111-111111111111', 'tst-gar-ls20', 48, 8, 'Finished Goods Bay F-1', now()),
    ('bs-21', '11111111-1111-1111-1111-111111111111', 'tst-gar-hd21', 52, 14, 'Finished Goods Bay F-2', now()),
    ('bs-22', '11111111-1111-1111-1111-111111111111', 'tst-gar-jk22', 38, 6, 'Finished Goods Bay F-3', now()),

    -- Siem Reap / Maritime Port Depot (SR-01 / op-2)
    ('bs-23', '22222222-2222-2222-2222-222222222222', 'tst-fab-mw01', 180, 50, 'Maritime Export Bay #1', now()),
    ('bs-24', '22222222-2222-2222-2222-222222222222', 'tst-knt-sj04', 160, 45, 'Maritime Export Bay #2', now()),
    ('bs-25', '22222222-2222-2222-2222-222222222222', 'tst-spx-ps10', 150, 40, 'Maritime Export Bay #3', now()),
    ('bs-26', '22222222-2222-2222-2222-222222222222', 'tst-gar-rn13', 90, 25, 'Export Container Bay #4', now()),
    ('bs-27', '22222222-2222-2222-2222-222222222222', 'tst-gar-fb14', 80, 20, 'Export Container Bay #5', now()),
    ('bs-28', '22222222-2222-2222-2222-222222222222', 'tst-gar-lg17', 95, 30, 'Export Container Bay #6', now()),
    ('bs-29', '22222222-2222-2222-2222-222222222222', 'tst-gar-hd21', 45, 10, 'Export Container Bay #7', now()),

    -- Battambang / Bavet Border Regional Branch (BTB-01 / op-3)
    ('bs-30', '33333333-3333-3333-3333-333333333333', 'tst-fab-uv02', 70, 15, 'Bavet Border Staging A-1', now()),
    ('bs-31', '33333333-3333-3333-3333-333333333333', 'tst-knt-ft09', 60, 12, 'Bavet Border Staging A-2', now()),
    ('bs-32', '33333333-3333-3333-3333-333333333333', 'tst-spx-ns11', 80, 20, 'Bavet Border Staging A-3', now()),
    ('bs-33', '33333333-3333-3333-3333-333333333333', 'tst-gar-sh18', 65, 14, 'Bavet Border Staging B-1', now()),
    ('bs-34', '33333333-3333-3333-3333-333333333333', 'tst-gar-jk22', 35, 8, 'Bavet Border Staging B-2', now())
on conflict (id) do update set 
    on_hand_quantity = excluded.on_hand_quantity,
    reserved_quantity = excluded.reserved_quantity,
    warehouse_location = excluded.warehouse_location,
    updated_at = now();

-- 5. Cooperator Consignment Stock (Partner Garment Plants)
insert into public.cooperator_stock (id, cooperator_id, product_id, quantity, updated_at)
values
    ('cs-1', '55555555-5555-5555-5555-555555555555', 'tst-fab-mw01', 65, now()),
    ('cs-2', '55555555-5555-5555-5555-555555555555', 'tst-spx-ps10', 45, now()),
    ('cs-3', '55555555-5555-5555-5555-555555555555', 'tst-knt-sj04', 50, now()),
    ('cs-4', '55555555-5555-5555-5555-555555555555', 'tst-gar-rn13', 20, now())
on conflict (id) do update set
    quantity = excluded.quantity,
    updated_at = now();
