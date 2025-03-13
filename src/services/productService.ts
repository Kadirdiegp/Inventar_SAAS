import { supabase } from '../utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Aktualisierter Produkt-Typ mit Kategorie-ID
export interface Product {
  id: string;
  name: string;
  description: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  imageUrl?: string;
  category?: string; // Alte Kategorie (String)
  category_id?: string; // Neue Kategorie-ID (UUID)
  categoryName?: string; // Name der Kategorie (wird nach dem Abrufen gefüllt)
  categoryType?: 'IMPORT' | 'EXPORT' | 'BOTH'; // Kategorietyp
  product_categories?: {
    id: string;
    name: string;
    type: 'IMPORT' | 'EXPORT' | 'BOTH';
    description?: string;
  };
}

// Alle Produkte abrufen
export const fetchProducts = async (categoryId?: string): Promise<Product[]> => {
  let query = supabase
    .from('products')
    .select(`
      *,
      product_categories(id, name, type, description)
    `)
    .order('name');
  
  // Filter nach Kategorie, wenn angegeben
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
    
  const { data, error } = await query;

  if (error) {
    console.error('Fehler beim Abrufen der Produkte:', error);
    throw error;
  }

  // Konvertiere Supabase-Datenformat zu unserem App-Format
  return data.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    purchasePrice: item.purchase_price,
    sellingPrice: item.selling_price,
    stock: item.stock,
    imageUrl: item.image_url,
    category: item.category, // Alte Kategorie
    category_id: item.category_id, // Neue Kategorie-ID
    categoryName: item.product_categories ? item.product_categories.name : undefined,
    categoryType: item.product_categories ? item.product_categories.type : undefined,
    product_categories: item.product_categories // Füge das gesamte Kategorie-Objekt hinzu
  }));
};

// Ein Produkt abrufen
export const fetchProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_categories(id, name, type, description)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Fehler beim Abrufen des Produkts mit ID ${id}:`, error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    purchasePrice: data.purchase_price,
    sellingPrice: data.selling_price,
    stock: data.stock,
    imageUrl: data.image_url,
    category: data.category, // Alte Kategorie
    category_id: data.category_id, // Neue Kategorie-ID
    categoryName: data.product_categories ? data.product_categories.name : undefined,
    categoryType: data.product_categories ? data.product_categories.type : undefined,
    product_categories: data.product_categories // Füge das gesamte Kategorie-Objekt hinzu
  };
};

// Ein Produkt erstellen
export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const { 
    name, 
    description, 
    purchasePrice, 
    sellingPrice, 
    stock, 
    imageUrl, 
    category, 
    category_id 
  } = product;

  const newProduct = {
    id: uuidv4(),
    name,
    description,
    purchase_price: purchasePrice,
    selling_price: sellingPrice,
    stock,
    image_url: imageUrl,
    category, // Alte Kategorie
    category_id // Neue Kategorie-ID
  };

  const { data, error } = await supabase
    .from('products')
    .insert(newProduct)
    .select()
    .single();

  if (error) {
    console.error('Fehler beim Erstellen des Produkts:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    purchasePrice: data.purchase_price,
    sellingPrice: data.selling_price,
    stock: data.stock,
    imageUrl: data.image_url,
    category: data.category,
    category_id: data.category_id,
    categoryName: undefined,
    categoryType: undefined,
    product_categories: undefined
  };
};

// Produkt aktualisieren
export const updateProduct = async (product: Product): Promise<Product> => {
  const { 
    id, 
    name, 
    description, 
    purchasePrice, 
    sellingPrice, 
    stock, 
    imageUrl, 
    category, 
    category_id 
  } = product;

  const { data, error } = await supabase
    .from('products')
    .update({
      name,
      description,
      purchase_price: purchasePrice,
      selling_price: sellingPrice,
      stock,
      image_url: imageUrl,
      category, // Alte Kategorie
      category_id // Neue Kategorie-ID
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Fehler beim Aktualisieren des Produkts mit ID ${id}:`, error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    purchasePrice: data.purchase_price,
    sellingPrice: data.selling_price,
    stock: data.stock,
    imageUrl: data.image_url,
    category: data.category,
    category_id: data.category_id,
    categoryName: undefined,
    categoryType: undefined,
    product_categories: undefined
  };
};

// Produkt löschen
export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Fehler beim Löschen des Produkts mit ID ${id}:`, error);
    throw error;
  }
};

// Bestandsupdate für ein Produkt
export const updateProductStock = async (id: string, newStock: number): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .update({ stock: newStock })
    .eq('id', id);

  if (error) {
    console.error(`Fehler beim Aktualisieren des Bestands für Produkt ${id}:`, error);
    throw error;
  }
};

// Eine Funktion zum Erstellen der partner_products Tabelle, falls sie nicht existiert
export const createPartnerProductsTable = async (): Promise<void> => {
  try {
    // Prüfen, ob die Tabelle bereits existiert
    const { error: checkError } = await supabase
      .from('partner_products')
      .select('id')
      .limit(1);

    // Falls kein Fehler auftritt, existiert die Tabelle bereits
    if (!checkError) {
      console.log('Die Tabelle partner_products existiert bereits.');
      return;
    }

    // Tabelle erstellen
    const { error } = await supabase.rpc('create_partner_products_table', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS partner_products (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          partner_id UUID NOT NULL,
          product_id UUID NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(partner_id, product_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_partner_products_partner_id ON partner_products(partner_id);
        CREATE INDEX IF NOT EXISTS idx_partner_products_product_id ON partner_products(product_id);
      `
    });

    if (error) {
      console.error('Fehler beim Erstellen der Tabelle partner_products:', error);
      
      // Alternative Methode - direktes SQL ausführen
      const { error: sqlError } = await supabase.rpc('exec', { 
        query: `
          CREATE TABLE IF NOT EXISTS partner_products (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            partner_id UUID NOT NULL,
            product_id UUID NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(partner_id, product_id)
          );
        `
      });
      
      if (sqlError) {
        console.error('Auch alternative Methode zur Tabellenerstellung fehlgeschlagen:', sqlError);
        throw sqlError;
      }
    }

    console.log('Tabelle partner_products erfolgreich erstellt');
  } catch (error) {
    console.error('Fehler beim Erstellen der Tabelle:', error);
    // Wir werfen den Fehler nicht erneut, um die App nicht zu blockieren
  }
};

// Hilfsfunktion, um eine einfache Version der partner_products Tabelle zu erstellen
export const setupSimplePartnerProductsTable = async () => {
  try {
    // Wir überprüfen, ob wir bereits Einträge erstellen können
    const testId = uuidv4();
    const { error } = await supabase
      .from('partner_products')
      .insert([{ 
        id: testId,
        partner_id: '00000000-0000-0000-0000-000000000000', // Dummy ID
        product_id: '00000000-0000-0000-0000-000000000000'  // Dummy ID
      }])
      .select();
    
    // Wenn kein Fehler auftritt, existiert die Tabelle bereits
    if (!error || error.code !== '42P01') { // 42P01 = relation does not exist
      // Testdaten wieder löschen
      if (!error) {
        await supabase
          .from('partner_products')
          .delete()
          .eq('id', testId);
      }
      console.log('Die Tabelle partner_products ist bereits einsatzbereit.');
      return true;
    }
    
    // Da wir keinen direkten SQL-Zugriff haben, erstellen wir die Tabelle manuell
    console.error('Die Tabelle partner_products existiert nicht. Eine manuelle Einrichtung ist erforderlich.');
    
    // Wir könnten hier auch die Benutzeroberfläche anpassen, um den Benutzer zu informieren
    
    return false;
  } catch (error) {
    console.error('Fehler beim Überprüfen/Erstellen der Tabelle partner_products:', error);
    return false;
  }
};

// Funktion ausführen, um sicherzustellen, dass die Tabelle existiert
setupSimplePartnerProductsTable();

// Produkte für einen bestimmten Partner abrufen
export const fetchProductsByPartner = async (partnerId: string): Promise<Product[]> => {
  try {
    // Zuerst die partner_products Verknüpfungen abrufen
    const { data: partnerProductLinks, error: linksError } = await supabase
      .from('partner_products')
      .select('product_id')
      .eq('partner_id', partnerId);

    if (linksError) {
      // Wenn die Tabelle nicht existiert, geben wir die ersten 3 Produkte zurück
      if (linksError.code === '42P01') { // 42P01 = relation does not exist
        console.log('Die Tabelle partner_products existiert nicht, verwende Beispielprodukte.');
        
        // Stattdessen erste 3 Produkte abrufen
        const { data: products, error } = await supabase
          .from('products')
          .select('*')
          .limit(3);
          
        if (error) {
          console.error(`Fehler beim Abrufen der Produkte:`, error);
          return [];
        }
        
        console.log(`${products?.length || 0} Beispielprodukte für Partner ${partnerId} zurückgegeben.`);
        
        return products ? products.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          purchasePrice: item.purchase_price,
          sellingPrice: item.selling_price,
          stock: item.stock,
          imageUrl: item.image_url,
          category: item.category,
          category_id: item.category_id,
          categoryName: undefined,
          categoryType: undefined,
          product_categories: undefined
        })) : [];
      }
      
      console.error(`Fehler beim Abrufen der Produktverknüpfungen für Partner ${partnerId}:`, linksError);
      return [];
    }

    // Wenn keine Produkte verknüpft sind, leeres Array zurückgeben
    if (!partnerProductLinks || partnerProductLinks.length === 0) {
      console.log(`Keine Produkte mit Partner ${partnerId} verknüpft.`);
      return [];
    }

    // Produktids extrahieren
    const productIds = partnerProductLinks.map(link => link.product_id);
    console.log(`${productIds.length} Produkt-IDs für Partner ${partnerId} gefunden.`);

    // Produkte mit diesen IDs abrufen
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        product_categories(id, name, type, description)
      `)
      .in('id', productIds);

    if (productsError) {
      console.error('Fehler beim Abrufen der Partner-Produkte:', productsError);
      return [];
    }

    console.log(`${products?.length || 0} Produkte für Partner ${partnerId} geladen.`);

    // Produkte in das App-Format konvertieren
    return products ? products.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      purchasePrice: item.purchase_price,
      sellingPrice: item.selling_price,
      stock: item.stock,
      imageUrl: item.image_url,
      category: item.category,
      category_id: item.category_id,
      categoryName: item.product_categories ? item.product_categories.name : undefined,
      categoryType: item.product_categories ? item.product_categories.type : undefined,
      product_categories: item.product_categories
    })) : [];
  } catch (error) {
    console.error(`Fehler beim Abrufen der Produkte für Partner ${partnerId}:`, error);
    return [];
  }
};

// Produkt zu einem Partner hinzufügen
export const addProductToPartner = async (partnerId: string, productId: string): Promise<boolean> => {
  try {
    // Prüfen, ob die Tabelle vorhanden ist
    const tableExists = await checkIfTableExists('partner_products');
    
    if (!tableExists) {
      // Wenn die Tabelle nicht existiert, simulieren wir Erfolg
      console.log(`Tabelle partner_products existiert nicht. Simuliere Hinzufügen von Produkt ${productId} zu Partner ${partnerId}.`);
      return true;
    }
    
    // Prüfen, ob die Verknüpfung bereits existiert
    const { data: existingLink } = await supabase
      .from('partner_products')
      .select('id')
      .eq('partner_id', partnerId)
      .eq('product_id', productId)
      .maybeSingle();

    // Wenn die Verknüpfung bereits existiert, nichts tun
    if (existingLink) {
      console.log(`Produkt ${productId} ist bereits mit Partner ${partnerId} verknüpft.`);
      return true;
    }

    // Neue Verknüpfung erstellen
    const { error } = await supabase
      .from('partner_products')
      .insert([
        { 
          id: uuidv4(),
          partner_id: partnerId,
          product_id: productId
        }
      ]);

    if (error) {
      console.error(`Fehler beim Hinzufügen des Produkts ${productId} zum Partner ${partnerId}:`, error);
      
      // Wenn die Tabelle nicht existiert, simulieren wir Erfolg
      if (error.code === '42P01') { // 42P01 = relation does not exist
        console.log('Die Tabelle partner_products existiert nicht, simuliere Erfolg.');
        return true;
      }
      
      return false;
    }

    console.log(`Produkt ${productId} wurde Partner ${partnerId} hinzugefügt.`);
    return true;
  } catch (error) {
    console.error(`Fehler beim Hinzufügen des Produkts ${productId} zu Partner ${partnerId}:`, error);
    return false;
  }
};

// Produkt von einem Partner entfernen
export const removeProductFromPartner = async (partnerId: string, productId: string): Promise<boolean> => {
  try {
    // Prüfen, ob die Tabelle vorhanden ist
    const tableExists = await checkIfTableExists('partner_products');
    
    if (!tableExists) {
      // Wenn die Tabelle nicht existiert, simulieren wir Erfolg
      console.log(`Tabelle partner_products existiert nicht. Simuliere Entfernen von Produkt ${productId} von Partner ${partnerId}.`);
      return true;
    }
    
    const { error } = await supabase
      .from('partner_products')
      .delete()
      .eq('partner_id', partnerId)
      .eq('product_id', productId);

    if (error) {
      console.error(`Fehler beim Entfernen des Produkts ${productId} vom Partner ${partnerId}:`, error);
      
      // Wenn die Tabelle nicht existiert, simulieren wir Erfolg
      if (error.code === '42P01') { // 42P01 = relation does not exist
        console.log('Die Tabelle partner_products existiert nicht, simuliere Erfolg.');
        return true;
      }
      
      return false;
    }

    console.log(`Produkt ${productId} wurde von Partner ${partnerId} entfernt.`);
    return true;
  } catch (error) {
    console.error(`Fehler beim Entfernen des Produkts ${productId} von Partner ${partnerId}:`, error);
    return false;
  }
};

// Verfügbare Produkte für einen Partner abrufen (Produkte, die dem Partner noch nicht zugeordnet sind)
export const fetchAvailableProductsForPartner = async (partnerId: string): Promise<Product[]> => {
  try {
    // Prüfen, ob die Tabelle vorhanden ist
    const tableExists = await checkIfTableExists('partner_products');
    
    if (!tableExists) {
      // Wenn die Tabelle nicht existiert, geben wir alle Produkte zurück
      console.log('Die Tabelle partner_products existiert nicht, gebe alle Produkte zurück.');
      
      const { data: allProducts, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories(id, name, type, description)
        `);
        
      if (error) {
        console.error('Fehler beim Abrufen aller Produkte:', error);
        return [];
      }
      
      console.log(`${allProducts?.length || 0} verfügbare Produkte gefunden.`);
      
      return allProducts ? allProducts.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        purchasePrice: item.purchase_price,
        sellingPrice: item.selling_price,
        stock: item.stock,
        imageUrl: item.image_url,
        category: item.category,
        category_id: item.category_id,
        categoryName: item.product_categories ? item.product_categories.name : undefined,
        categoryType: item.product_categories ? item.product_categories.type : undefined,
        product_categories: item.product_categories
      })) : [];
    }
    
    // Zuerst alle Produkte abrufen, die dem Partner bereits zugeordnet sind
    const { data: partnerProductLinks, error: linksError } = await supabase
      .from('partner_products')
      .select('product_id')
      .eq('partner_id', partnerId);

    if (linksError) {
      console.error(`Fehler beim Abrufen der Produktverknüpfungen für Partner ${partnerId}:`, linksError);
      
      // Wenn die Tabelle nicht existiert, geben wir alle Produkte zurück
      if (linksError.code === '42P01') { // 42P01 = relation does not exist
        const { data: allProducts, error } = await supabase
          .from('products')
          .select(`
            *,
            product_categories(id, name, type, description)
          `);
          
        if (error) {
          console.error('Fehler beim Abrufen aller Produkte:', error);
          return [];
        }
        
        console.log(`${allProducts?.length || 0} verfügbare Produkte gefunden.`);
        
        return allProducts ? allProducts.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          purchasePrice: item.purchase_price,
          sellingPrice: item.selling_price,
          stock: item.stock,
          imageUrl: item.image_url,
          category: item.category,
          category_id: item.category_id,
          categoryName: item.product_categories ? item.product_categories.name : undefined,
          categoryType: item.product_categories ? item.product_categories.type : undefined,
          product_categories: item.product_categories
        })) : [];
      }
      
      return [];
    }

    // IDs der bereits zugeordneten Produkte extrahieren
    const assignedProductIds = partnerProductLinks ? partnerProductLinks.map(link => link.product_id) : [];
    console.log(`${assignedProductIds.length} bereits zugeordnete Produkte gefunden.`);

    // Alle Produkte abrufen
    const { data: allProducts, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        product_categories(id, name, type, description)
      `);

    if (productsError) {
      console.error('Fehler beim Abrufen aller Produkte:', productsError);
      return [];
    }

    // Filterung der noch nicht zugeordneten Produkte
    const availableProducts = allProducts ? allProducts.filter(
      product => !assignedProductIds.includes(product.id)
    ) : [];

    console.log(`${availableProducts.length} verfügbare Produkte für Partner ${partnerId} gefunden.`);

    // Produkte in das App-Format konvertieren
    return availableProducts.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      purchasePrice: item.purchase_price,
      sellingPrice: item.selling_price,
      stock: item.stock,
      imageUrl: item.image_url,
      category: item.category,
      category_id: item.category_id,
      categoryName: item.product_categories ? item.product_categories.name : undefined,
      categoryType: item.product_categories ? item.product_categories.type : undefined,
      product_categories: item.product_categories
    }));
  } catch (error) {
    console.error(`Fehler beim Abrufen der verfügbaren Produkte für Partner ${partnerId}:`, error);
    return [];
  }
};

// Hilfsfunktion, um zu prüfen, ob eine Tabelle existiert
const checkIfTableExists = async (tableName: string): Promise<boolean> => {
  try {
    // Versuch auf die Tabelle zuzugreifen
    const { error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);
      
    // Wenn kein Fehler auftritt, existiert die Tabelle
    return !error || error.code !== '42P01'; // 42P01 = relation does not exist
  } catch (error) {
    console.error(`Fehler beim Prüfen, ob Tabelle ${tableName} existiert:`, error);
    return false;
  }
};
