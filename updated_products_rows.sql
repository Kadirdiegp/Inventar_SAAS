-- Updated Products SQL with correct category_id mappings
-- This file replaces the old products_rows (1).sql with updated category information

-- First, let's declare variables for each category ID to make the script more readable and maintainable
DO $$
DECLARE
    snacks_import_id UUID;
    snacks_export_id UUID;
    getraenke_import_id UUID;
    getraenke_export_id UUID;
    suesswaren_import_id UUID;
    suesswaren_export_id UUID;
    bueromoebel_import_id UUID;
    bueromoebel_export_id UUID;
    buerobedarf_import_id UUID;
    buerobedarf_export_id UUID;
BEGIN
    -- Get category IDs from the product_categories table
    SELECT id INTO snacks_import_id FROM public.product_categories WHERE name = 'Snacks - Import';
    SELECT id INTO snacks_export_id FROM public.product_categories WHERE name = 'Snacks - Export';
    SELECT id INTO getraenke_import_id FROM public.product_categories WHERE name = 'Getränke - Import';
    SELECT id INTO getraenke_export_id FROM public.product_categories WHERE name = 'Getränke - Export';
    SELECT id INTO suesswaren_import_id FROM public.product_categories WHERE name = 'Süßwaren - Import';
    SELECT id INTO suesswaren_export_id FROM public.product_categories WHERE name = 'Süßwaren - Export';
    SELECT id INTO bueromoebel_import_id FROM public.product_categories WHERE name = 'Büromöbel - Import';
    SELECT id INTO bueromoebel_export_id FROM public.product_categories WHERE name = 'Büromöbel - Export';
    SELECT id INTO buerobedarf_import_id FROM public.product_categories WHERE name = 'Bürobedarf - Import';
    SELECT id INTO buerobedarf_export_id FROM public.product_categories WHERE name = 'Bürobedarf - Export';

    -- Clear existing products if needed (uncommenting this would delete all products first)
    -- DELETE FROM public.products;

    -- Insert/Update products with the correct category mappings based on their original categories
    -- For "Takis Fuego" - was "Büromöbel", now mapped to "Büromöbel - Import"
    INSERT INTO public.products (id, name, description, purchase_price, selling_price, stock, image_url, category, category_id)
    VALUES ('14014892-5d4b-4f19-962f-14cd12f0d169', 'Takis Fuego', 'Verstellbarer ergonomischer Bürostuhl mit Lendenwirbelstütze', '1.00', '1.50', '8', 'data:image/webp;base64,UklGRtYPAABXRUJQVlA4IMoPAACQOwCdASqFAIUAPlkmj0UjoiEU/mXIOAWEtABrbjbkr+m822xv3H8R8ciVnr1/f/cb84P956s/zz/s/cD/Wzzufq...', 'Büromöbel', bueromoebel_import_id)
    ON CONFLICT (id) DO UPDATE SET 
        category_id = bueromoebel_import_id,
        updated_at = NOW();

    -- For "Takis Blue Heat" - was "Bürobedarf", now mapped to "Bürobedarf - Import"
    INSERT INTO public.products (id, name, description, purchase_price, selling_price, stock, image_url, category, category_id)
    VALUES ('188c5d01-b627-4d10-a33b-a5033ecfae7f', 'Takis Blue Heat', 'Dreistufige Dokumentenablage aus Metall', '1.00', '1.50', '20', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQZ4-Kf-7pKbJ9GDhMzNeOlreG4t1the-QSyF9mg8pAuK5gS3zxwt10K7Jfmmux5uHgs3ir13rWCAzXTqqx7VyWFiDnr-42aiU0EserqHBSHPZ4F7LB6kFKsrtMItbS&usqp=CAc', 'Bürobedarf', buerobedarf_import_id)
    ON CONFLICT (id) DO UPDATE SET 
        category_id = buerobedarf_import_id,
        updated_at = NOW();

    -- For "Schoko Croissant" - was "Kategorie A", now mapped to "Snacks - Import"
    INSERT INTO public.products (id, name, description, purchase_price, selling_price, stock, image_url, category, category_id)
    VALUES ('1fd22592-a313-4242-9365-5b23ddba0b94', 'Schoko Croissant', '7Days', '0.79', '0.99', '6', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTR94zkaxhRkDj8BPBJOWjmayfHaWcueNJlfUF8392ggtfx_52WfH85Ji3leoZn9tSGcXHPCdb_MPtS-HVUJ8y2LoDnwkfiNM8LMSGyShAq3mtw-_DwQXR7Ug', 'Kategorie A', snacks_import_id)
    ON CONFLICT (id) DO UPDATE SET 
        category_id = snacks_import_id,
        updated_at = NOW();

    -- For "Kinder Bueno Original" - need to determine proper category, mapping to "Süßwaren - Import"
    INSERT INTO public.products (id, name, description, purchase_price, selling_price, stock, image_url, category, category_id)
    VALUES ('28f0b5f7-fc74-43d9-8016-59f1d55d4b21', 'Kinder Bueno Original', 'Original 1x', '0.70', '0.90', '12', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxIQEBEQDxAWFhAWFRUXGBUWFRUYFRkXFxcYFxgXFRcYHSggGBsmHhUWITEhJSkrLi4uGCAzODMtNygtLisBCgoKDg0OGhAQGzclICYtLS0rLS0vLS8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy0tLS0tLS0tLS0tLTUtKy0tK...', 'Kategorie A', suesswaren_import_id)
    ON CONFLICT (id) DO UPDATE SET 
        category_id = suesswaren_import_id,
        updated_at = NOW();

    -- Continue with additional product entries as needed
    -- ...

END $$;

-- Finally, update the product display fields to match the new category structure
UPDATE public.products p
SET 
    category = pc.name
FROM public.product_categories pc
WHERE p.category_id = pc.id;

-- Optional: Show the updated product categories for verification
SELECT p.id, p.name, p.category, pc.name as category_name, pc.type as category_type
FROM public.products p
JOIN public.product_categories pc ON p.category_id = pc.id
ORDER BY p.name;
