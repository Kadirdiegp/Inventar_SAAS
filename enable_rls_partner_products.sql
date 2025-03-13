-- RLS für partner_products aktivieren
ALTER TABLE public.partner_products ENABLE ROW LEVEL SECURITY;

-- Richtlinie erstellen, die nur authentifizierten Benutzern Zugriff gewährt
CREATE POLICY "Authentifizierte Benutzer können partner_products lesen" 
ON public.partner_products
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Richtlinie erstellen, die nur authentifizierten Benutzern Einfügen erlaubt
CREATE POLICY "Authentifizierte Benutzer können partner_products einfügen" 
ON public.partner_products
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Richtlinie erstellen, die nur authentifizierten Benutzern Aktualisieren erlaubt
CREATE POLICY "Authentifizierte Benutzer können partner_products aktualisieren" 
ON public.partner_products
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Richtlinie erstellen, die nur authentifizierten Benutzern Löschen erlaubt
CREATE POLICY "Authentifizierte Benutzer können partner_products löschen" 
ON public.partner_products
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Anmerkung: Für eine noch feinere Kontrolle könnten Sie zusätzliche Bedingungen hinzufügen,
-- z.B. basierend auf user_id oder anderen Spalten für Besitzerschaft
