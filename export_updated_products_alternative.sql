-- Alternative approach to export updated products data
-- This uses the \copy meta-command which works in psql client

-- First ensure all categories are correctly set by running the fix_categories scripts

-- For products table:
-- Run this in psql:
-- \copy (SELECT id, name, description, purchase_price, selling_price, stock, image_url, category, created_at, updated_at, category_id FROM public.products ORDER BY name) TO 'updated_products_rows.csv' WITH CSV HEADER;

-- For product_categories table:
-- \copy (SELECT id, name, description, type, created_at, updated_at FROM public.product_categories ORDER BY name) TO 'updated_product_categories_rows.csv' WITH CSV HEADER;

-- Alternatively, you can use a SELECT statement to view the data and manually update the CSV files:

-- View updated products with their categories
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
  p.category_id,
  pc.name as category_name
FROM 
  public.products p
LEFT JOIN
  public.product_categories pc ON p.category_id = pc.id
ORDER BY 
  p.name;

-- View product categories
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
  name;
