import { Product, InvoiceItem } from '../types';

// Format currency to EUR
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Calculate invoice totals
export const calculateInvoiceTotals = (items: InvoiceItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.19; // 19% MwSt
  const total = subtotal + tax;
  
  return { subtotal, tax, total };
};

// Filter products by search term
export const filterProducts = (
  products: Product[], 
  searchTerm: string,
  category?: string
): Product[] => {
  return products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !category || category === 'all' || product.category === category;
    
    return matchesSearch && matchesCategory;
  });
};

// Format date to German format
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('de-DE');
};
