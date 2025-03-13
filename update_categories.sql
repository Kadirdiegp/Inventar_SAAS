-- Füge neue Kategorien hinzu, falls sie noch nicht existieren
INSERT INTO product_categories (id, name, type, description, created_at, updated_at)
VALUES
  ('b5c91f45-84ae-5b56-c193-f3e15fed5a1d', 'Vapes', 'IMPORT', 'E-Zigaretten und Zubehör', NOW(), NOW()),
  ('c6d92f56-95bf-6c67-d294-f4f26ffe6b2e', 'Zubehör', 'IMPORT', 'Allgemeines Zubehör', NOW(), NOW()),
  ('d7e93f67-a6cf-47d8-e3a5-f5f37fff7c3f', 'Aktion', 'BOTH', 'Aktionsartikel und Sonderangebote', NOW(), NOW()),
  ('e8f94f78-b7df-58e9-f4b6-f6f48fff8d4f', 'Getränke', 'IMPORT', 'Softdrinks und andere Getränke', NOW(), NOW()),
  ('f9fa5e89-c8e0-69fa-g5c7-g7g59ggg9e5g', 'Snacks', 'BOTH', 'Lokale Snacks und Knabbereien', NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    type = EXCLUDED.type,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Stelle sicher, dass die "Snacks - Import" Kategorie korrekt ist
UPDATE product_categories 
SET name = 'Snacks - Import', 
    type = 'IMPORT',
    description = 'Importierte Snacks und Knabbereien',
    updated_at = NOW()
WHERE id = 'a4b90e34-93be-4b45-b082-f2e14eed4a0c';
