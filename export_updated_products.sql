-- Export updated products data to CSV after category corrections

-- First, ensure all categories are correctly set
-- Run the category correction script first (fix_categories_step1.sql and fix_categories_step2.sql)

-- Export the updated products data to CSV
COPY (
  SELECT 
    p.id,
    p.name,
    p.description,
    p.purchase_price,
    p.selling_price,
    p.stock,
    p.image_url,
    p.category,
    p.created_at,
    p.updated_at,
    p.category_id
  FROM 
    public.products p
  ORDER BY 
    p.name
) TO '/tmp/updated_products_rows.csv' WITH CSV HEADER;

-- Export the product categories for reference
COPY (
  SELECT 
    id,
    name,
    description,
    type,
    created_at,
    updated_at
  FROM 
    public.product_categories
  ORDER BY 
    name
) TO '/tmp/updated_product_categories_rows.csv' WITH CSV HEADER;

-- Note: After running this script, you'll need to copy the CSV files from 
-- /tmp/updated_products_rows.csv and /tmp/updated_product_categories_rows.csv
-- to your project directory to replace the existing CSV files.
