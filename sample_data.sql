-- Beispiel-Produktdaten
INSERT INTO products (name, description, purchase_price, selling_price, stock, image_url, category)
VALUES
  ('Laptop Dell XPS 13', 'Hochleistungs-Laptop mit 16GB RAM und 512GB SSD', 800.00, 1200.00, 15, 'https://picsum.photos/200/300', 'Elektronik'),
  ('Bürostuhl Ergonomisch', 'Verstellbarer ergonomischer Bürostuhl mit Lendenwirbelstütze', 150.00, 299.99, 8, 'https://picsum.photos/200/300', 'Büromöbel'),
  ('Druckerpapier A4', 'Packung mit 500 Blatt A4-Papier, 80g/m²', 3.50, 5.99, 120, 'https://picsum.photos/200/300', 'Bürobedarf'),
  ('Whiteboard 90x120cm', 'Magnetisches Whiteboard mit Aluminiumrahmen', 45.00, 79.99, 5, 'https://picsum.photos/200/300', 'Büromöbel'),
  ('Kugelschreiber-Set', 'Set mit 10 blauen Kugelschreibern', 2.50, 4.99, 50, 'https://picsum.photos/200/300', 'Bürobedarf'),
  ('Monitorständer', 'Höhenverstellbarer Monitorständer aus Aluminium', 25.00, 39.99, 12, 'https://picsum.photos/200/300', 'Bürozubehör'),
  ('Externe Festplatte 2TB', 'USB 3.0 externe Festplatte mit 2TB Speicherplatz', 70.00, 119.99, 10, 'https://picsum.photos/200/300', 'Elektronik'),
  ('Schreibtischlampe LED', 'Dimmbare LED-Schreibtischlampe mit USB-Anschluss', 18.00, 34.99, 15, 'https://picsum.photos/200/300', 'Bürozubehör'),
  ('Dokumentenablage', 'Dreistufige Dokumentenablage aus Metall', 12.00, 22.99, 20, 'https://picsum.photos/200/300', 'Bürobedarf'),
  ('Wireless Maus', 'Ergonomische kabellose Maus mit leiser Klickfunktion', 15.00, 29.99, 25, 'https://picsum.photos/200/300', 'Elektronik');

-- Beispiel-Partnerdaten
INSERT INTO partners (name, contact, email, phone, address, notes)
VALUES
  ('TechSolutions GmbH', 'Max Mustermann', 'kontakt@techsolutions.de', '+49 123 456789', 'Hauptstraße 1, 10115 Berlin', 'Großkunde, bevorzugt monatliche Lieferungen'),
  ('Büroausstattung Schmidt', 'Anna Schmidt', 'info@buero-schmidt.de', '+49 234 567890', 'Industrieweg 42, 70565 Stuttgart', 'Spezialisiert auf Büromöbel'),
  ('Digitale Welt AG', 'Thomas Weber', 'weber@digitalewelt.de', '+49 345 678901', 'Technikstraße 7, 80333 München', 'Neukunde seit Januar 2025'),
  ('Schulbedarf Plus', 'Maria Schulz', 'bestellung@schulbedarfplus.de', '+49 456 789012', 'Schulweg 15, 60329 Frankfurt', 'Saisonale Bestellungen, hauptsächlich Q3'),
  ('Kreativ Studio', 'Laura Meyer', 'meyer@kreativstudio.de', '+49 567 890123', 'Künstlerplatz 3, 50667 Köln', 'Kleinere Bestellungen, aber regelmäßig');

-- Beispiel-Rechnungsdaten und Rechnungspositionen
-- Rechnung 1
INSERT INTO invoices (partner_id, partner_name, date, subtotal, tax, total, status, notes)
VALUES (
  (SELECT id FROM partners WHERE name = 'TechSolutions GmbH'),
  'TechSolutions GmbH',
  '2025-03-01',
  3600.00,
  684.00,
  4284.00,
  'Bezahlt',
  'Quartalsbestellung Q1/2025'
);

-- Rechnungspositionen für Rechnung 1
INSERT INTO invoice_items (invoice_id, product_id, product_name, quantity, unit_price, total)
VALUES
  (
    (SELECT id FROM invoices WHERE partner_name = 'TechSolutions GmbH' AND date = '2025-03-01'),
    (SELECT id FROM products WHERE name = 'Laptop Dell XPS 13'),
    'Laptop Dell XPS 13',
    3,
    1200.00,
    3600.00
  );

-- Rechnung 2
INSERT INTO invoices (partner_id, partner_name, date, subtotal, tax, total, status, notes)
VALUES (
  (SELECT id FROM partners WHERE name = 'Büroausstattung Schmidt'),
  'Büroausstattung Schmidt',
  '2025-03-05',
  1499.95,
  284.99,
  1784.94,
  'Ausstehend',
  'Lieferung erfolgt am 15.03.2025'
);

-- Rechnungspositionen für Rechnung 2
INSERT INTO invoice_items (invoice_id, product_id, product_name, quantity, unit_price, total)
VALUES
  (
    (SELECT id FROM invoices WHERE partner_name = 'Büroausstattung Schmidt' AND date = '2025-03-05'),
    (SELECT id FROM products WHERE name = 'Bürostuhl Ergonomisch'),
    'Bürostuhl Ergonomisch',
    5,
    299.99,
    1499.95
  );

-- Rechnung 3
INSERT INTO invoices (partner_id, partner_name, date, subtotal, tax, total, status, notes)
VALUES (
  (SELECT id FROM partners WHERE name = 'Kreativ Studio'),
  'Kreativ Studio',
  '2025-03-10',
  359.92,
  68.38,
  428.30,
  'Entwurf',
  'Auf Kundenwunsch noch nicht versendet'
);

-- Rechnungspositionen für Rechnung 3
INSERT INTO invoice_items (invoice_id, product_id, product_name, quantity, unit_price, total)
VALUES
  (
    (SELECT id FROM invoices WHERE partner_name = 'Kreativ Studio' AND date = '2025-03-10'),
    (SELECT id FROM products WHERE name = 'Whiteboard 90x120cm'),
    'Whiteboard 90x120cm',
    2,
    79.99,
    159.98
  ),
  (
    (SELECT id FROM invoices WHERE partner_name = 'Kreativ Studio' AND date = '2025-03-10'),
    (SELECT id FROM products WHERE name = 'Schreibtischlampe LED'),
    'Schreibtischlampe LED',
    4,
    34.99,
    139.96
  ),
  (
    (SELECT id FROM invoices WHERE partner_name = 'Kreativ Studio' AND date = '2025-03-10'),
    (SELECT id FROM products WHERE name = 'Dokumentenablage'),
    'Dokumentenablage',
    2,
    22.99,
    45.98
  ),
  (
    (SELECT id FROM invoices WHERE partner_name = 'Kreativ Studio' AND date = '2025-03-10'),
    (SELECT id FROM products WHERE name = 'Kugelschreiber-Set'),
    'Kugelschreiber-Set',
    3,
    4.99,
    14.97
  );
