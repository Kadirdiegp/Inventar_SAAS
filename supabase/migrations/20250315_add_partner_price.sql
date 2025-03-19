-- Migration: Add partner_price column to partner_products table
-- This allows storing partner-specific prices for products

-- First check if the column already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'partner_products' 
        AND column_name = 'partner_price'
    ) THEN
        -- Add the partner_price column to store partner-specific pricing
        ALTER TABLE partner_products
        ADD COLUMN partner_price DECIMAL(10, 2) DEFAULT NULL;
        
        -- Add comment to explain the purpose of this column
        COMMENT ON COLUMN partner_products.partner_price IS 'Custom price charged to the partner for this product';
    END IF;
END $$;
