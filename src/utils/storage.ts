import { Product, Partner, Invoice } from '../types';
import { generateId } from './helpers';
import { supabase } from '../utils/supabaseClient';

// Sample initial data
const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Produkt 1',
    description: 'Beschreibung für Produkt 1',
    sellingPrice: 19.99,
    stock: 25,
    imageUrl: '/placeholder.jpg',
    category: 'Kategorie A'
  },
  {
    id: 'prod-2',
    name: 'Produkt 2',
    description: 'Beschreibung für Produkt 2',
    sellingPrice: 29.99,
    stock: 15,
    imageUrl: '/placeholder.jpg',
    category: 'Kategorie B'
  },
];

const initialPartners: Partner[] = [
  {
    id: 'partner-1',
    name: 'Partner GmbH',
    contact: 'Max Mustermann',
    email: 'kontakt@partner.de',
    phone: '0123 456789',
    address: 'Musterstraße 1, 12345 Musterstadt',
    notes: 'Wichtiger Partner'
  },
  {
    id: 'partner-2',
    name: 'Beispiel AG',
    contact: 'Erika Musterfrau',
    email: 'info@beispiel.de',
    phone: '0987 654321',
    address: 'Beispielweg 2, 54321 Beispielstadt',
    notes: 'Neuer Partner seit 2024'
  },
];

// Local Storage Keys
const PRODUCTS_KEY = 'inventory_products';
const PARTNERS_KEY = 'inventory_partners';
const INVOICES_KEY = 'inventory_invoices';

// Product Storage Functions
export const getProducts = (): Product[] => {
  const storedProducts = localStorage.getItem(PRODUCTS_KEY);
  if (!storedProducts) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(initialProducts));
    return initialProducts;
  }
  return JSON.parse(storedProducts);
};

export const saveProduct = (product: Omit<Product, 'id'>): Product => {
  const products = getProducts();
  const newProduct = { ...product, id: generateId() };
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify([...products, newProduct]));
  return newProduct;
};

export const updateProduct = (product: Product): Product => {
  const products = getProducts();
  const updatedProducts = products.map(p => p.id === product.id ? product : p);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));
  return product;
};

export const deleteProduct = (id: string): void => {
  const products = getProducts();
  const filteredProducts = products.filter(p => p.id !== id);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filteredProducts));
};

// Partner Storage Functions
export const getPartners = async (): Promise<Partner[]> => {
  try {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Fehler beim Abrufen der Partner:', error);
      throw error;
    }
    
    if (!data) {
      return [];
    }
    
    return data as Partner[];
  } catch (error) {
    console.error('Fehler beim Abrufen der Partner:', error);
    return [];
  }
};

export const savePartner = (partner: Omit<Partner, 'id'>): Partner => {
  const partners = getPartnersSync();
  const newPartner = { ...partner, id: generateId() };
  localStorage.setItem(PARTNERS_KEY, JSON.stringify([...partners, newPartner]));
  return newPartner;
};

export const updatePartner = (partner: Partner): Partner => {
  const partners = getPartnersSync();
  const updatedPartners = partners.map(p => p.id === partner.id ? partner : p);
  localStorage.setItem(PARTNERS_KEY, JSON.stringify(updatedPartners));
  return partner;
};

export const deletePartner = (id: string): void => {
  const partners = getPartnersSync();
  const filteredPartners = partners.filter(p => p.id !== id);
  localStorage.setItem(PARTNERS_KEY, JSON.stringify(filteredPartners));
};

// Invoice Storage Functions
export const getInvoices = async (): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*');

  if (error) {
    console.error('Fehler beim Abrufen der Rechnungen:', error);
    return [];
  }

  return (data || []) as Invoice[]; // Rückgabe eines leeren Arrays, wenn data null ist
};

export const saveInvoice = async (invoice: Omit<Invoice, 'id'>): Promise<Invoice> => {
  const { data, error } = await supabase
    .from('invoices')
    .insert([invoice])
    .select();  // Füge select() hinzu, um die eingefügten Daten zurückzugeben

  if (error) {
    console.error('Fehler beim Speichern der Rechnung:', error);
    throw error;
  }

  // TypeScript-freundliche Überprüfung mit Type Guard
  if (!data) {
    throw new Error('Keine Daten zurückgegeben');
  }
  
  const invoiceData = data as any[];
  if (invoiceData.length === 0) {
    throw new Error('Keine Rechnung eingefügt');
  }

  return invoiceData[0] as Invoice;
};

export const updateInvoice = async (invoice: Invoice): Promise<Invoice> => {
  const invoices = await getInvoices();
  const updatedInvoices = invoices.map(i => i.id === invoice.id ? invoice : i);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(updatedInvoices));
  return invoice;
};

export const deleteInvoice = async (id: string): Promise<void> => {
  const invoices = await getInvoices();
  const filteredInvoices = invoices.filter(i => i.id !== id);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(filteredInvoices));
};

// Helper function to get partners synchronously
function getPartnersSync(): Partner[] {
  const storedPartners = localStorage.getItem(PARTNERS_KEY);
  if (!storedPartners) {
    localStorage.setItem(PARTNERS_KEY, JSON.stringify(initialPartners));
    return initialPartners;
  }
  return JSON.parse(storedPartners);
}
