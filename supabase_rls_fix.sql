-- SQL-Script zur Konfiguration der Row-Level Security (RLS) für partner_products
-- Dieses Script behebt die 401 Unauthorized Fehler bei Zugriffen auf die Tabelle

-- 1. RLS für die Tabelle aktivieren (falls noch nicht geschehen)
ALTER TABLE partner_products ENABLE ROW LEVEL SECURITY;

-- 2. Bestehende Policies löschen, um sauber zu starten
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON partner_products;
DROP POLICY IF EXISTS "Allow select for authenticated users" ON partner_products;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON partner_products;

-- 3. Neue Policies erstellen
-- Select Policy: Ermöglicht allen authentifizierten Benutzern das Lesen
CREATE POLICY "Allow select for authenticated users"
ON partner_products
FOR SELECT
USING (auth.role() = 'authenticated');

-- Insert Policy: Ermöglicht allen authentifizierten Benutzern das Einfügen
CREATE POLICY "Allow insert for authenticated users"
ON partner_products
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Delete Policy: Ermöglicht allen authentifizierten Benutzern das Löschen
CREATE POLICY "Allow delete for authenticated users"
ON partner_products
FOR DELETE
USING (auth.role() = 'authenticated');

-- 4. Eine Policy für alle Operationen (alternativ zu den obigen einzelnen Policies)
-- Kommentiere die obigen drei Policies aus und entferne diesen Kommentar, wenn du diese Option bevorzugst
-- CREATE POLICY "Allow all operations for authenticated users"
-- ON partner_products
-- USING (auth.role() = 'authenticated');

-- 5. Für den Fall, dass du die Tabelle über Service Role-Zugriff verwalten möchtest
-- (Dies ist eine fortgeschrittenere Option für Server-zu-Server Kommunikation)
-- In diesem Fall würdest du den Supabase-Client mit dem service_role key statt dem anon key initialisieren
-- und die Policies entsprechend anpassen.
