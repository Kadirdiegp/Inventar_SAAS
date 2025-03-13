-- Fix product categories to match the product_categories table

-- Create a temporary mapping table for old category name to new category id
CREATE TEMPORARY TABLE category_mapping (
  old_category VARCHAR(255),
  new_category_id UUID
);

-- Populate the mapping table with the correct mappings
INSERT INTO category_mapping (old_category, new_category_id) VALUES 
('Büromöbel', '7f90e3e4-59a9-46fb-aa59-85a46754ddc2'),  -- Maps to 'Büromöbel - Import'
('Bürobedarf', '6fff1d5c-edc8-45a7-8c8f-56931513b1fd'), -- Maps to 'Bürobedarf - Import'
('Kategorie A', 'a4b90e34-93be-4b45-b082-f2e14eed4a0c'); -- Maps to 'Snacks - Import'

-- Special case for Kinder Bueno Original which should be mapped to Süßwaren - Import
UPDATE public.products 
SET category_id = '11916465-72fa-4ea2-98f9-5098d8ccac80',
    category = 'Süßwaren - Import' 
WHERE name LIKE '%Kinder Bueno%';

-- Update all other products based on the mapping table
UPDATE public.products p
SET category = pc.name
FROM category_mapping cm
JOIN public.product_categories pc ON cm.new_category_id = pc.id
WHERE p.category = cm.old_category;

-- Ensure all products have the proper category_id
UPDATE public.products p
SET category_id = cm.new_category_id
FROM category_mapping cm
WHERE p.category = cm.old_category
  AND p.name NOT LIKE '%Kinder Bueno%'; -- exclude the special case we already handled

-- Verify the changes
SELECT 
  p.id, 
  p.name, 
  p.category AS current_category, 
  pc.name AS category_name,
  p.category_id,
  pc.id AS category_id_from_table
FROM public.products p
LEFT JOIN public.product_categories pc ON p.category_id = pc.id
ORDER BY p.name;

-- Clean up
DROP TABLE category_mapping;
