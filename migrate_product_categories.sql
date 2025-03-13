-- Prüfen und Erstellen der Kategorie-Tabelle, falls sie noch nicht existiert
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) CHECK (type IN ('IMPORT', 'EXPORT', 'BOTH')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS für Kategorien aktivieren, falls die Tabelle gerade erstellt wurde
DO $$
BEGIN
    -- Prüfe, ob RLS bereits aktiviert ist, um unnötige Fehler zu vermeiden
    IF NOT EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE tablename = 'product_categories'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Richtlinien für Kategorien erstellen, falls sie nicht existieren
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_categories' AND policyname = 'Authentifizierte Benutzer können Kategorien lesen') THEN
        CREATE POLICY "Authentifizierte Benutzer können Kategorien lesen" 
        ON public.product_categories FOR SELECT 
        USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_categories' AND policyname = 'Authentifizierte Benutzer können Kategorien einfügen') THEN
        CREATE POLICY "Authentifizierte Benutzer können Kategorien einfügen" 
        ON public.product_categories FOR INSERT 
        WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_categories' AND policyname = 'Authentifizierte Benutzer können Kategorien aktualisieren') THEN
        CREATE POLICY "Authentifizierte Benutzer können Kategorien aktualisieren" 
        ON public.product_categories FOR UPDATE 
        USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_categories' AND policyname = 'Authentifizierte Benutzer können Kategorien löschen') THEN
        CREATE POLICY "Authentifizierte Benutzer können Kategorien löschen" 
        ON public.product_categories FOR DELETE 
        USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Hinzufügen einer Kategoriespalte zur Produkttabelle, falls sie noch nicht existiert
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE public.products 
        ADD COLUMN category_id UUID REFERENCES public.product_categories(id);
        
        -- Erstellen eines Indexes für schnellere Abfragen
        CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
    END IF;
END $$;

-- Migriere bestehende Kategorien aus den Produktdaten in die neue product_categories-Tabelle
-- und aktualisiere die Produkte mit den passenden category_id-Werten

-- 1. Temporäre Tabelle für die bestehenden Kategorien erstellen
CREATE TEMPORARY TABLE temp_categories AS
SELECT DISTINCT category, COUNT(*) as product_count
FROM public.products
WHERE category IS NOT NULL AND category != ''
GROUP BY category;

-- 2. Kategorien-Mapping
-- Basierend auf den vorhandenen Kategorien in den Produktdaten
-- Erstelle eine zugeordnete Kategorie basierend auf den bestehenden Namen

-- Prüfen, ob bereits Kategorien vorhanden sind (falls das add_product_categories.sql bereits ausgeführt wurde)
DO $$
DECLARE
  category_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO category_count FROM public.product_categories;
  
  -- Nur einfügen, wenn noch keine Kategorien vorhanden sind
  IF category_count = 0 THEN
    -- Beispiel-Kategorien einfügen
    INSERT INTO public.product_categories (name, description, type) VALUES
    ('Snacks - Import', 'Importierte Snackprodukte', 'IMPORT'),
    ('Snacks - Export', 'Für den Export bestimmte Snackprodukte', 'EXPORT'),
    ('Getränke - Import', 'Importierte Getränkeprodukte', 'IMPORT'),
    ('Getränke - Export', 'Für den Export bestimmte Getränkeprodukte', 'EXPORT'),
    ('Süßwaren - Import', 'Importierte Süßwarenprodukte', 'IMPORT'),
    ('Süßwaren - Export', 'Für den Export bestimmte Süßwarenprodukte', 'EXPORT'),
    ('Büromöbel - Import', 'Importierte Büromöbelprodukte', 'IMPORT'),
    ('Büromöbel - Export', 'Für den Export bestimmte Büromöbelprodukte', 'EXPORT'),
    ('Bürobedarf - Import', 'Importierte Bürobedarfsprodukte', 'IMPORT'),
    ('Bürobedarf - Export', 'Für den Export bestimmte Bürobedarfsprodukte', 'EXPORT');
  END IF;
END $$;

-- 3. Definiere Mapping für bestehende Kategorien
CREATE TEMPORARY TABLE category_mapping (
  old_category VARCHAR(255),
  new_category_id UUID
);

-- 4. Fülle das Mapping mit Daten
-- "Büromöbel" -> "Büromöbel - Import"
INSERT INTO category_mapping
SELECT 'Büromöbel', id FROM public.product_categories WHERE name = 'Büromöbel - Import';

-- "Bürobedarf" -> "Bürobedarf - Import"
INSERT INTO category_mapping
SELECT 'Bürobedarf', id FROM public.product_categories WHERE name = 'Bürobedarf - Import';

-- "Kategorie A" -> "Snacks - Import" (Annahme basierend auf Produktbeispielen)
INSERT INTO category_mapping
SELECT 'Kategorie A', id FROM public.product_categories WHERE name = 'Snacks - Import';

-- Füge weitere Mappings für andere Kategorien hinzu (als Standardwert)
INSERT INTO category_mapping
SELECT tc.category, pc.id
FROM temp_categories tc
LEFT JOIN category_mapping cm ON tc.category = cm.old_category
CROSS JOIN (SELECT id FROM public.product_categories WHERE name = 'Snacks - Import' LIMIT 1) pc
WHERE cm.old_category IS NULL;

-- 5. Aktualisiere die Produkte mit den neuen Kategorie-IDs
UPDATE public.products p
SET category_id = cm.new_category_id
FROM category_mapping cm
WHERE p.category = cm.old_category;

-- 6. Zeige eine Zusammenfassung der Migration an
SELECT 
  pc.name AS new_category_name, 
  pc.type AS category_type,
  COUNT(p.id) AS product_count
FROM public.products p
JOIN public.product_categories pc ON p.category_id = pc.id
GROUP BY pc.name, pc.type
ORDER BY pc.name;

-- 7. Temporäre Tabellen aufräumen
DROP TABLE temp_categories;
DROP TABLE category_mapping;
