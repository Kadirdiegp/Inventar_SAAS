-- Aktualisieren der Foreign-Key-Beziehung zwischen invoices und partners
-- um ON DELETE CASCADE hinzuzufügen

-- 1. Zuerst die bestehende Constraint entfernen
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_partner_id_fkey;

-- 2. Neue Constraint mit ON DELETE CASCADE hinzufügen
ALTER TABLE invoices 
  ADD CONSTRAINT invoices_partner_id_fkey 
  FOREIGN KEY (partner_id) 
  REFERENCES partners(id) 
  ON DELETE CASCADE;

-- Stellen Sie sicher, dass auch die invoice_items gelöscht werden, wenn eine Rechnung gelöscht wird
-- (Dies sollte bereits durch die vorherige Konfiguration mit ON DELETE CASCADE eingerichtet sein)
ALTER TABLE invoice_items DROP CONSTRAINT IF EXISTS invoice_items_invoice_id_fkey;

ALTER TABLE invoice_items 
  ADD CONSTRAINT invoice_items_invoice_id_fkey 
  FOREIGN KEY (invoice_id) 
  REFERENCES invoices(id) 
  ON DELETE CASCADE;
