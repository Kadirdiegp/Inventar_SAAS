// Skript zum Importieren der Produktdaten
const fs = require('fs');

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

// Schreibe die Daten in eine temporäre CSV-Datei
fs.writeFileSync('temp_products.csv', productsData);

// Parsen der CSV-Datei und Umwandlung in JSON
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
        name: productName,
        description: `Importiert aus CSV am ${new Date().toLocaleDateString()}`,
        stock: parseInt(currentLine[1]),
        originalPrice: parseFloat(currentLine[2]),
        purchasePrice: parseFloat(currentLine[3]),
        sellingPrice: parseFloat(currentLine[4]),
        imageUrl: '',
        category_id: null,
      };
      
      products.push(product);
    }
  }
  
  return products;
};

// Produkte in JSON-Format konvertieren
const products = parseCSV();

// Ausgabe der Produkte als JSON
fs.writeFileSync('products_to_import.json', JSON.stringify(products, null, 2));

console.log(`${products.length} Produkte wurden in products_to_import.json konvertiert.`);
console.log('Bitte verwenden Sie das Inventarsystem, um diese Datei zu importieren oder verwenden Sie folgendes API-Skript:');
console.log('\nBeispiel:');
console.log('// Mit dem supabase-Modul können diese Daten wie folgt importiert werden:');
console.log('// import { createClient } from "@supabase/supabase-js";');
console.log('// const supabaseUrl = "IHRE_SUPABASE_URL";');
console.log('// const supabaseKey = "SUPABASE_SERVICE_KEY";');
console.log('// const supabase = createClient(supabaseUrl, supabaseKey);');
console.log('// für jedes Produkt in products:');
console.log('//   await supabase.from("products").insert({');
console.log('//     name: product.name,');
console.log('//     description: product.description,');
console.log('//     selling_price: product.sellingPrice,');
console.log('//     purchase_price: product.purchasePrice,');
console.log('//     stock: product.stock,');
console.log('//     image_url: "",');
console.log('//     category_id: null');
console.log('//   });');
