-- Step 1: Update all remaining products with proper category names based on their category_id

-- Fix products with Snacks - Import category_id
UPDATE public.products 
SET category = 'Snacks - Import'
WHERE category_id = 'a4b90e34-93be-4b45-b082-f2e14eed4a0c'
  AND category != 'Snacks - Import';

-- Fix products with Bürobedarf - Import category_id
UPDATE public.products 
SET category = 'Bürobedarf - Import'
WHERE category_id = '6fff1d5c-edc8-45a7-8c8f-56931513b1fd'
  AND category != 'Bürobedarf - Import';

-- Fix products with Büromöbel - Import category_id
UPDATE public.products 
SET category = 'Büromöbel - Import'
WHERE category_id = '7f90e3e4-59a9-46fb-aa59-85a46754ddc2'
  AND category != 'Büromöbel - Import';

-- Step 2: Special category assignments for specific product types

-- Update all Kinder products to Süßwaren - Import
UPDATE public.products 
SET category = 'Süßwaren - Import',
    category_id = '11916465-72fa-4ea2-98f9-5098d8ccac80'
WHERE name LIKE 'Kinder %'
  AND category != 'Süßwaren - Import';

-- Update Nerds products to Süßwaren - Import as well
UPDATE public.products 
SET category = 'Süßwaren - Import',
    category_id = '11916465-72fa-4ea2-98f9-5098d8ccac80'
WHERE name LIKE 'Nerds %';

-- Update Pringles products to Snacks - Import
UPDATE public.products 
SET category = 'Snacks - Import',
    category_id = 'a4b90e34-93be-4b45-b082-f2e14eed4a0c'
WHERE name LIKE 'Pringles %'
  AND name != 'Pringles Sour Cream'; -- This one stays as Bürobedarf - Import

-- Verify the changes
SELECT 
  id, 
  name, 
  category,
  category_id
FROM public.products
ORDER BY name;
