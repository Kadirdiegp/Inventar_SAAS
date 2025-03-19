// Script zum direkten Import der Produkte in die Supabase-Datenbank
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Supabase-Konfiguration
const supabaseUrl = "https://vopxtqldmxwpmsoojdkg.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvcHh0cWxkbXh3cG1zb29qZGtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTg4MDc3OCwiZXhwIjoyMDU3NDU2Nzc4fQ.QstZgtAEV-OpIHueutZjUFQCKp1NzQxXR73PR182CL4";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Fehler: Supabase-URL oder Service-Key nicht definiert');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Die Daten aus dem String, der in der Anfrage bereitgestellt wurde
const productsData = `Produkt;Menge;Originalpreis;Einkaufspreis;Verkaufspreis
Pringles Sweet Paprika;24;48.00;14.40;33.60
Takis Blue Heat 92,3g;3;11.97;2.97;9.00
Takis Fuego;9;35.91;8.91;27.00
Nic Nacks 110g;6;17.94;3.71;14.23
Schoko Bons Crispy 67,2g;4;7.96;1.96;6.00
Nerds Grape 64,7g;8;23.92;5.92;18.00
Croissant Mega;4;11.96;2.96;9.00
"10 AM… (unbekannt)";10;26.90;6.90;20.00
Mars 51g;30;44.70;14.70;30.00
Snickers Almond 40g;8;15.92;3.92;12.00
Kinder Bueno 43g;16;31.20;7.20;24.00
Duplo 18,2g;4;7.96;1.96;6.00
M&Ms Chocolate 45g;8;15.92;3.92;12.00
Skittles 38g;4;7.96;1.96;6.00
Toffifee 125g;9;26.91;8.91;18.00
DIP N GO;6;10.20;2.20;8.00
Cludiz mini 30g;1;3.49;0.49;3.00
Haribo Pasta Frutta Fizz;3;10.35;2.35;8.00
Hubba Babo Tutti Frutti;70;34.30;14.30;20.00
Milka Kuhflecken;6;12.00;3.00;9.00
Vape Auswahl;25;250.00;63.80;186.20
"OCB + Filter";32;28.80;8.80;20.00`;

// Parsen der CSV-Daten
const parseCSV = () => {
  const products = [];
  const lines = productsData.split('\n');
  
  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].split(';');
    
    // Prüfen, ob die Zeile gültige Daten enthält
    if (currentLine.length >= 5) {
      // In einigen Zeilen können Anführungszeichen sein, diese entfernen
      let productName = currentLine[0];
      if (productName.startsWith('"') && productName.endsWith('"')) {
        productName = productName.substring(1, productName.length - 1);
      }
      
      const product = {
        id: uuidv4(),
        name: productName,
        description: `Importiert am ${new Date().toLocaleDateString()}`,
        stock: parseInt(currentLine[1]),
        purchase_price: parseFloat(currentLine[3]),
        selling_price: parseFloat(currentLine[4]),
        image_url: '',
        category_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      products.push(product);
    }
  }
  
  return products;
};

// Produkte in die Datenbank importieren
const importProducts = async () => {
  try {
    const products = parseCSV();
    console.log(`${products.length} Produkte werden importiert...`);
    
    // Produkte in Batches von 10 importieren, um Überlastung zu vermeiden
    const batchSize = 10;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('products')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`Fehler beim Importieren von Produkten (Batch ${i/batchSize + 1}):`, error);
      } else {
        console.log(`Batch ${i/batchSize + 1} erfolgreich importiert: ${data.length} Produkte`);
      }
      
      // Kurze Pause, um die API nicht zu überlasten
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('Import abgeschlossen!');
  } catch (error) {
    console.error('Fehler beim Importieren der Produkte:', error);
  }
};

// Führe den Import aus
importProducts();
