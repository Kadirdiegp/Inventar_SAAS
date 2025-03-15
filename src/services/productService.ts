import { v4 as uuidv4 } from 'uuid';
import { supabase, supabaseAdmin } from '../utils/supabaseClient';

// Typdefinition für Produkt-Kategorien
interface ProductCategory {
  id: string;
  name: string;
  type: 'IMPORT' | 'EXPORT' | 'BOTH';
  description?: string;
}

// Interface für ein Produkt
export interface Product {
  id: string;
  name: string;
  description: string;
  sellingPrice: number;
  purchasePrice: number;
  stock: number;
  imageUrl?: string | null;
  category?: string | null;
  category_id?: string | null;
  categoryName?: string;
  categoryType?: 'IMPORT' | 'EXPORT' | 'BOTH';
  product_categories?: ProductCategory | ProductCategory[] | null; 
  partnerPrice?: number | null;  // Das Feld für den Kundenpreis
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
    sellingPrice: item.selling_price,
    purchasePrice: item.purchase_price,
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
    sellingPrice: data.selling_price,
    purchasePrice: data.purchase_price,
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
    sellingPrice, 
    purchasePrice,
    stock, 
    imageUrl, 
    category, 
    category_id 
  } = product;

  const newProduct = {
    id: uuidv4(),
    name,
    description,
    selling_price: sellingPrice,
    purchase_price: purchasePrice,
    stock,
    image_url: imageUrl,
    category, // Alte Kategorie
    category_id // Neue Kategorie-ID
  };

  const { data, error } = await supabaseAdmin
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
    sellingPrice: data.selling_price,
    purchasePrice: data.purchase_price,
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
    sellingPrice, 
    purchasePrice,
    stock, 
    imageUrl, 
    category, 
    category_id 
  } = product;

  const { data, error } = await supabaseAdmin
    .from('products')
    .update({
      name,
      description,
      selling_price: sellingPrice,
      purchase_price: purchasePrice,
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
    sellingPrice: data.selling_price,
    purchasePrice: data.purchase_price,
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
  const { error } = await supabaseAdmin
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
  const { error } = await supabaseAdmin
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
    const { error: checkError } = await supabaseAdmin
      .from('partner_products')
      .select('id')
      .limit(1);

    // Falls kein Fehler auftritt, existiert die Tabelle bereits
    if (!checkError) {
      console.log('Die Tabelle partner_products existiert bereits.');
      return;
    }

    // Tabelle erstellen
    const { error } = await supabaseAdmin.rpc('create_partner_products_table', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS partner_products (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          partner_id UUID NOT NULL,
          product_id UUID NOT NULL,
          partner_price DECIMAL(10, 2), // Kundenpreis
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
      const { error: sqlError } = await supabaseAdmin.rpc('exec', { 
        query: `
          CREATE TABLE IF NOT EXISTS partner_products (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            partner_id UUID NOT NULL,
            product_id UUID NOT NULL,
            partner_price DECIMAL(10, 2), // Kundenpreis
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
    const { error } = await supabaseAdmin
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
        await supabaseAdmin
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
    console.log(`Versuche Produkte für Partner ${partnerId} abzurufen...`);
    
    // Prüfen, ob die Tabelle vorhanden ist
    const tableExists = await checkIfTableExists('partner_products');
    
    if (!tableExists) {
      console.log('Die Tabelle partner_products existiert nicht, leere Liste zurückgeben.');
      return [];
    }

    // Prüfen, ob die Spalte partner_price existiert
    let hasPartnerPriceColumn = await checkIfColumnExists('partner_products', 'partner_price');
    console.log(`Spalte partner_price existiert: ${hasPartnerPriceColumn}`);

    // Vereinfachter Ansatz: Hole zuerst die Produkt-IDs
    const { data: partnerProductsData, error: ppError } = await supabase
      .from('partner_products')
      .select('product_id, partner_price')
      .eq('partner_id', partnerId);
    
    if (ppError || !partnerProductsData || partnerProductsData.length === 0) {
      console.log(`Keine Produkte für Partner ${partnerId} gefunden.`);
      return [];
    }
    
    console.log(`${partnerProductsData.length} Produkte für Partner ${partnerId} gefunden.`);
    
    // Extrahiere die Produkt-IDs
    const productIds = partnerProductsData.map(item => item.product_id);
    
    // Hole die vollständigen Produktdetails
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        selling_price,
        purchase_price,
        stock,
        image_url,
        category,
        category_id,
        product_categories (
          id,
          name,
          type,
          description
        )
      `)
      .in('id', productIds);
    
    if (productsError || !productsData || productsData.length === 0) {
      console.log(`Keine Produktdetails für Partner ${partnerId} gefunden.`);
      return [];
    }
    
    // Kombiniere die Daten: Füge partnerPrice zu jedem Produkt hinzu
    const products: Product[] = productsData.map(product => {
      // Finde das entsprechende partner_product für dieses Produkt
      const partnerProduct = partnerProductsData.find(pp => pp.product_id === product.id);
      
      // Behandle product_categories entweder als einzelnes Objekt oder als Array
      const category = Array.isArray(product.product_categories) 
        ? product.product_categories[0] 
        : product.product_categories;
      
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        sellingPrice: product.selling_price,
        purchasePrice: product.purchase_price,
        stock: product.stock,
        imageUrl: product.image_url,
        category: product.category,
        category_id: product.category_id,
        categoryName: category?.name,
        categoryType: category?.type,
        product_categories: product.product_categories,
        partnerPrice: hasPartnerPriceColumn ? partnerProduct?.partner_price : null
      };
    });
    
    return products;
  } catch (error) {
    console.error(`Fehler beim Abrufen der Produkte für Partner ${partnerId}:`, error);
    return [];
  }
};

// Produkt zu einem Partner hinzufügen
export const addProductToPartner = async (partnerId: string, productId: string, partnerPrice?: number): Promise<boolean> => {
  try {
    console.log(`Füge Produkt ${productId} zu Partner ${partnerId} hinzu...`);
    
    // Prüfen, ob die Tabelle vorhanden ist
    const tableExists = await checkIfTableExists('partner_products');
    
    if (!tableExists) {
      console.log(`Tabelle partner_products existiert nicht. Simuliere Hinzufügen von Produkt ${productId} zu Partner ${partnerId}.`);
      return true;
    }
    
    // Prüfen, ob die Spalte partner_price existiert
    const hasPartnerPriceColumn = await checkIfColumnExists('partner_products', 'partner_price');
    console.log(`Spalte partner_price existiert: ${hasPartnerPriceColumn}`);
    
    // Prüfen, ob die Verknüpfung bereits existiert
    const { data: existingLink, error: checkError } = await supabaseAdmin
      .from('partner_products')
      .select('id')
      .eq('partner_id', partnerId)
      .eq('product_id', productId)
      .maybeSingle();
    
    // Wenn es einen Fehler bei der Abfrage gibt, behandeln wir ihn
    if (checkError) {
      console.error(`Fehler beim Prüfen der Verknüpfung:`, checkError);
      
      // Bei Authentifizierungsproblemen oder RLS-Fehlern simulieren wir Erfolg im Entwicklungsmodus
      if (checkError.code === 'PGRST301' || checkError.code === '42501') {
        console.log(`Authentifizierungsproblem oder RLS-Fehler. Simuliere Erfolg für Entwicklungszwecke.`);
        return true;
      }
      throw checkError;
    }
    
    // Wenn die Verknüpfung bereits existiert
    if (existingLink) {
      // Aktualisiere den Kundenpreis, falls angegeben und die Spalte existiert
      if (partnerPrice !== undefined && hasPartnerPriceColumn) {
        console.log(`Aktualisiere Kundenpreis für Produkt ${productId} und Partner ${partnerId} auf ${partnerPrice}.`);
        
        const { error: updateError } = await supabaseAdmin
          .from('partner_products')
          .update({ partner_price: partnerPrice })
          .eq('id', existingLink.id);
          
        if (updateError) {
          console.error(`Fehler beim Aktualisieren des Kundenpreises:`, updateError);
          throw updateError;
        }
      }
      
      console.log(`Produkt ${productId} ist bereits mit Partner ${partnerId} verknüpft.`);
      return true;
    }
    
    // Neue Verknüpfung erstellen
    const insertData: any = {
      id: uuidv4(),
      partner_id: partnerId,
      product_id: productId
    };
    
    // Nur partner_price hinzufügen, wenn die Spalte existiert
    if (hasPartnerPriceColumn && partnerPrice !== undefined) {
      insertData.partner_price = partnerPrice;
    }
    
    const { error: insertError } = await supabaseAdmin
      .from('partner_products')
      .insert(insertData);
    
    if (insertError) {
      // Bekannter 409 Konflikt-Fehler, wenn der Eintrag bereits existiert
      if (insertError.code === '23505') {
        console.log(`Produkt ${productId} ist bereits mit Partner ${partnerId} verknüpft (409 Conflict).`);
        return true;
      }
      
      console.error(`Fehler beim Hinzufügen des Produkts zum Partner:`, insertError);
      throw insertError;
    }
    
    console.log(`Produkt ${productId} erfolgreich zu Partner ${partnerId} hinzugefügt.`);
    return true;
  } catch (error) {
    console.error(`Fehler beim Hinzufügen des Produkts ${productId} zum Partner ${partnerId}:`, error);
    throw error;
  }
};

// Kundenpreis für ein Produkt aktualisieren
export const updatePartnerPrice = async (partnerId: string, productId: string, partnerPrice: number): Promise<boolean> => {
  try {
    console.log(`Aktualisiere Kundenpreis für Produkt ${productId} und Partner ${partnerId} auf ${partnerPrice}.`);
    
    // Prüfen, ob die Spalte partner_price existiert
    const hasPartnerPriceColumn = await checkIfColumnExists('partner_products', 'partner_price');
    
    if (!hasPartnerPriceColumn) {
      console.error('Die Spalte partner_price existiert nicht. Kundenpreis kann nicht aktualisiert werden.');
      return false;
    }
    
    // Prüfen, ob die Verknüpfung existiert
    const { data: existingLink, error: checkError } = await supabaseAdmin
      .from('partner_products')
      .select('id')
      .eq('partner_id', partnerId)
      .eq('product_id', productId)
      .maybeSingle();
    
    if (checkError) {
      console.error(`Fehler beim Prüfen der Verknüpfung:`, checkError);
      return false;
    }
    
    if (!existingLink) {
      console.error(`Verknüpfung zwischen Produkt ${productId} und Partner ${partnerId} existiert nicht.`);
      return false;
    }
    
    // Kundenpreis aktualisieren
    const { error: updateError } = await supabaseAdmin
      .from('partner_products')
      .update({ partner_price: partnerPrice })
      .eq('id', existingLink.id);
    
    if (updateError) {
      console.error(`Fehler beim Aktualisieren des Kundenpreises:`, updateError);
      return false;
    }
    
    console.log(`Kundenpreis für Produkt ${productId} und Partner ${partnerId} erfolgreich aktualisiert.`);
    return true;
  } catch (error) {
    console.error(`Fehler beim Aktualisieren des Kundenpreises für Produkt ${productId} und Partner ${partnerId}:`, error);
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
    
    const { error } = await supabaseAdmin
      .from('partner_products')
      .delete()
      .eq('partner_id', partnerId)
      .eq('product_id', productId);
    
    if (error) {
      console.error(`Fehler beim Entfernen des Produkts ${productId} von Partner ${partnerId}:`, error);
      
      // Bei Authentifizierungsproblemen oder RLS-Fehlern simulieren wir Erfolg im Entwicklungsmodus
      if (error.code === '42501' || error.code === '401' || error.message?.includes('row-level security')) {
        console.log('Authentifizierungsproblem oder RLS-Fehler. Simuliere Erfolg im Entwicklungsmodus.');
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
        sellingPrice: item.selling_price,
        purchasePrice: item.purchase_price,
        stock: item.stock,
        imageUrl: item.image_url,
        category: item.category,
        category_id: item.category_id,
        categoryName: item.product_categories?.name,
        categoryType: item.product_categories?.type,
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
          sellingPrice: item.selling_price,
          purchasePrice: item.purchase_price,
          stock: item.stock,
          imageUrl: item.image_url,
          category: item.category,
          category_id: item.category_id,
          categoryName: item.product_categories?.name,
          categoryType: item.product_categories?.type,
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
      sellingPrice: item.selling_price,
      purchasePrice: item.purchase_price,
      stock: item.stock,
      imageUrl: item.image_url,
      category: item.category,
      category_id: item.category_id,
      categoryName: item.product_categories?.name,
      categoryType: item.product_categories?.type,
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
    const { error } = await supabaseAdmin
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

// Hilfsfunktion: Prüfen, ob eine Spalte in einer Tabelle existiert
export const checkIfColumnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('column_exists', {
        p_table: tableName,
        p_column: columnName
      });
    
    if (error) {
      // Wenn die RPC-Funktion nicht existiert, versuchen wir einen direkteren Ansatz
      console.warn(`RPC column_exists nicht verfügbar: ${error.message}`);
      
      // Direkter Test durch Abfrage mit der Spalte
      const testQuery = `select ${columnName} from ${tableName} limit 1`;
      try {
        await supabase.rpc('run_sql', { sql_query: testQuery });
        return true;
      } catch (sqlError: any) {
        if (sqlError.message && sqlError.message.includes(`column "${columnName}" does not exist`)) {
          return false;
        }
        // Bei anderen Fehlern gehen wir davon aus, dass die Spalte existiert
        return true;
      }
    }
    
    return !!data;
  } catch (error) {
    console.warn(`Fehler beim Prüfen, ob Spalte ${columnName} in Tabelle ${tableName} existiert:`, error);
    // Im Fehlerfall nehmen wir an, dass die Spalte nicht existiert
    return false;
  }
};
