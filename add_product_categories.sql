-- Erstellung der Kategorie-Tabelle
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) CHECK (type IN ('IMPORT', 'EXPORT', 'BOTH')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS für Kategorien aktivieren
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Richtlinien für Kategorien erstellen
CREATE POLICY "Authentifizierte Benutzer können Kategorien lesen" 
ON public.product_categories FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authentifizierte Benutzer können Kategorien einfügen" 
ON public.product_categories FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authentifizierte Benutzer können Kategorien aktualisieren" 
ON public.product_categories FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authentifizierte Benutzer können Kategorien löschen" 
ON public.product_categories FOR DELETE 
USING (auth.role() = 'authenticated');

-- Beispiel-Kategorien einfügen
INSERT INTO public.product_categories (name, description, type) VALUES
('Snacks - Import', 'Importierte Snackprodukte', 'IMPORT'),
('Snacks - Export', 'Für den Export bestimmte Snackprodukte', 'EXPORT'),
('Getränke - Import', 'Importierte Getränkeprodukte', 'IMPORT'),
('Getränke - Export', 'Für den Export bestimmte Getränkeprodukte', 'EXPORT'),
('Süßwaren - Import', 'Importierte Süßwarenprodukte', 'IMPORT'),
('Süßwaren - Export', 'Für den Export bestimmte Süßwarenprodukte', 'EXPORT'),
('Konserven - Import', 'Importierte Konservenprodukte', 'IMPORT'),
('Konserven - Export', 'Für den Export bestimmte Konservenprodukte', 'EXPORT');

-- Hinzufügen einer Kategoriespalte zur Produkttabelle
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.product_categories(id);

-- Erstellen eines Indexes für schnellere Abfragen
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);

-- Trigger für das Aktualisieren des updated_at-Feldes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_categories_updated_at
BEFORE UPDATE ON public.product_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
