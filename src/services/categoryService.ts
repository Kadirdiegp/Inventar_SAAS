import { supabase } from '../utils/supabaseClient';

export interface ProductCategory {
  id: string;
  name: string;
  description: string | null;
  type: 'IMPORT' | 'EXPORT' | 'BOTH';
  created_at: string;
  updated_at: string;
}

/**
 * Lädt alle Produktkategorien aus der Datenbank
 */
export const fetchCategories = async (): Promise<ProductCategory[]> => {
  try {
    console.log('Fetching categories from Supabase...');
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      // Fallback-Kategorien verwenden, wenn ein Fehler auftritt
      return getFallbackCategories();
    }

    console.log('Categories fetched:', data);
    
    // Wenn keine Daten zurückgegeben werden, verwende Fallback-Kategorien
    if (!data || data.length === 0) {
      console.log('No categories found in database, using fallback categories');
      return getFallbackCategories();
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchCategories:', error);
    // Fallback-Kategorien verwenden, wenn ein Fehler auftritt
    return getFallbackCategories();
  }
};

// Hilfsfunktion, um Fallback-Kategorien zu erhalten
const getFallbackCategories = (): ProductCategory[] => {
  console.log('Using fallback categories');
  return [
    {
      id: 'b5c91f45-84ae-5b56-c193-f3e15fed5a1d',
      name: 'Vapes',
      type: 'IMPORT',
      description: 'E-Zigaretten und Zubehör',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'c6d92f56-95bf-6c67-d294-f4f26ffe6b2e',
      name: 'Zubehör',
      type: 'IMPORT',
      description: 'Allgemeines Zubehör',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'd7e93f67-a6cf-47d8-e3a5-f5f37fff7c3f',
      name: 'Aktion',
      type: 'BOTH',
      description: 'Aktionsartikel und Sonderangebote',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'a4b90e34-93be-4b45-b082-f2e14eed4a0c',
      name: 'Snacks - Import',
      type: 'IMPORT',
      description: 'Importierte Snacks und Knabbereien',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'f9fa5e89-c8e0-69fa-g5c7-g7g59ggg9e5g',
      name: 'Snacks',
      type: 'BOTH',
      description: 'Lokale Snacks und Knabbereien',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'e8f94f78-b7df-58e9-f4b6-f6f48fff8d4f',
      name: 'Getränke',
      type: 'IMPORT',
      description: 'Softdrinks und andere Getränke',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
};

/**
 * Erstellt eine neue Produktkategorie
 */
export const createCategory = async (category: Omit<ProductCategory, 'id' | 'created_at' | 'updated_at'>): Promise<ProductCategory> => {
  try {
    const { data, error } = await supabase
      .from('product_categories')
      .insert(category)
      .select()
      .single();
    
    if (error) {
      console.error('Fehler beim Erstellen der Kategorie:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Fehler beim Erstellen der Kategorie:', error);
    throw error;
  }
};

/**
 * Aktualisiert eine bestehende Produktkategorie
 */
export const updateCategory = async (id: string, updates: Partial<Omit<ProductCategory, 'id' | 'created_at' | 'updated_at'>>): Promise<ProductCategory> => {
  try {
    const { data, error } = await supabase
      .from('product_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Fehler beim Aktualisieren der Kategorie:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Kategorie:', error);
    throw error;
  }
};

/**
 * Löscht eine Produktkategorie
 */
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('product_categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Fehler beim Löschen der Kategorie:', error);
      throw error;
    }
  } catch (error) {
    console.error('Fehler beim Löschen der Kategorie:', error);
    throw error;
  }
};
