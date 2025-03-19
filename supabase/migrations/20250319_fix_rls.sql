-- Fix for tables with RLS disabled
-- Addresses security lints found in Supabase dashboard

-- First, ensure RLS is enabled for all public tables
ALTER TABLE IF EXISTS public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.partner_products ENABLE ROW LEVEL SECURITY;

-- Re-create policies for product_categories if they don't exist
DO $$
BEGIN
    -- For product_categories
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_categories' AND policyname = 'Enable read access for all users') THEN
        CREATE POLICY "Enable read access for all users" ON product_categories
            FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_categories' AND policyname = 'Enable insert for authenticated users only') THEN
        CREATE POLICY "Enable insert for authenticated users only" ON product_categories
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_categories' AND policyname = 'Enable update for authenticated users only') THEN
        CREATE POLICY "Enable update for authenticated users only" ON product_categories
            FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_categories' AND policyname = 'Enable delete for authenticated users only') THEN
        CREATE POLICY "Enable delete for authenticated users only" ON product_categories
            FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
    
    -- For products
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Enable read access for all users') THEN
        CREATE POLICY "Enable read access for all users" ON products
            FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Enable insert for authenticated users only') THEN
        CREATE POLICY "Enable insert for authenticated users only" ON products
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Enable update for authenticated users only') THEN
        CREATE POLICY "Enable update for authenticated users only" ON products
            FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Enable delete for authenticated users only') THEN
        CREATE POLICY "Enable delete for authenticated users only" ON products
            FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
    
    -- For partner_products
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partner_products' AND policyname = 'Enable read access for all users') THEN
        CREATE POLICY "Enable read access for all users" ON partner_products
            FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partner_products' AND policyname = 'Enable insert for authenticated users only') THEN
        CREATE POLICY "Enable insert for authenticated users only" ON partner_products
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partner_products' AND policyname = 'Enable update for authenticated users only') THEN
        CREATE POLICY "Enable update for authenticated users only" ON partner_products
            FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partner_products' AND policyname = 'Enable delete for authenticated users only') THEN
        CREATE POLICY "Enable delete for authenticated users only" ON partner_products
            FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END $$;
