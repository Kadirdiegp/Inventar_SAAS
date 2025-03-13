-- Step 1: Update Takis Fuego to use the correct category
UPDATE public.products 
SET category = 'Büromöbel - Import',
    category_id = '7f90e3e4-59a9-46fb-aa59-85a46754ddc2'
WHERE id = '14014892-5d4b-4f19-962f-14cd12f0d169';

-- Step 2: Update Takis Blue Heat to use the correct category
UPDATE public.products 
SET category = 'Bürobedarf - Import',
    category_id = '6fff1d5c-edc8-45a7-8c8f-56931513b1fd'
WHERE id = '188c5d01-b627-4d10-a33b-a5033ecfae7f';

-- Step 3: Update Schoko Croissant to use the correct category
UPDATE public.products 
SET category = 'Snacks - Import',
    category_id = 'a4b90e34-93be-4b45-b082-f2e14eed4a0c'
WHERE id = '1fd22592-a313-4242-9365-5b23ddba0b94';

-- Step 4: Update Kinder Bueno Original to use the correct category
UPDATE public.products 
SET category = 'Süßwaren - Import',
    category_id = '11916465-72fa-4ea2-98f9-5098d8ccac80'
WHERE id = '28f0b5f7-fc74-43d9-8016-59f1d55d4b21';

-- Verify the changes
SELECT 
  id, 
  name, 
  category,
  category_id
FROM public.products
ORDER BY name;
