-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON product_categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON product_categories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON product_categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON product_categories;

DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;

DROP POLICY IF EXISTS "Enable read access for all users" ON partner_products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON partner_products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON partner_products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON partner_products;

-- Enable Row Level Security
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_products ENABLE ROW LEVEL SECURITY;

-- Create policies for product_categories
CREATE POLICY "Enable read access for all users" ON product_categories
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON product_categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON product_categories
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON product_categories
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for products
CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON products
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for partner_products
CREATE POLICY "Enable read access for all users" ON partner_products
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON partner_products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON partner_products
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON partner_products
    FOR DELETE USING (auth.role() = 'authenticated');
