import { Product, Partner, Invoice } from '../types';
import { generateId } from './helpers';
import { supabase } from '../utils/supabaseClient';
import { createInvoice, updateInvoice as updateInvoiceService, deleteInvoice as deleteInvoiceService, fetchInvoices } from '../services/invoiceService'; // Korrigierter Import-Pfad

// Sample initial data
const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Produkt 1',
    description: 'Beschreibung für Produkt 1',
    sellingPrice: 19.99,
    purchasePrice: 14.99,
    stock: 25,
    imageUrl: '/placeholder.jpg',
    category: 'Kategorie A'
  },
  {
    id: 'prod-2',
    name: 'Produkt 2',
    description: 'Beschreibung für Produkt 2',
    sellingPrice: 29.99,
    purchasePrice: 22.99,
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
  try {
    // Verwende die fetchInvoices-Funktion aus invoiceService.ts, 
    // die korrekt Rechnungen und ihre Positionen abruft
    const invoices = await fetchInvoices();
    return invoices;
  } catch (error) {
    console.error('Fehler beim Abrufen der Rechnungen:', error);
    return [];
  }
};

export const saveInvoice = async (invoice: Omit<Invoice, 'id'>): Promise<Invoice> => {
  try {
    // Verwende die createInvoice-Funktion aus invoiceService.ts
    // die korrekt mit der Datenbankstruktur umgeht (separate Tabellen für Rechnungen und Rechnungspositionen)
    const newInvoice = await createInvoice(invoice);
    return newInvoice;
  } catch (error) {
    console.error('Fehler beim Speichern der Rechnung:', error);
    throw error;
  }
};

export const updateInvoice = async (invoice: Invoice): Promise<Invoice> => {
  try {
    // Verwende die updateInvoice-Funktion aus invoiceService.ts
    const updatedInvoice = await updateInvoiceService(invoice);
    return updatedInvoice;
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Rechnung:', error);
    throw error;
  }
};

export const deleteInvoice = async (id: string): Promise<void> => {
  try {
    // Verwende die deleteInvoice-Funktion aus invoiceService.ts
    await deleteInvoiceService(id);
  } catch (error) {
    console.error('Fehler beim Löschen der Rechnung:', error);
    throw error;
  }
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
