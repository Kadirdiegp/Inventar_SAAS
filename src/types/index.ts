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
  product_categories?: {
    id: string;
    name: string;
    type: 'IMPORT' | 'EXPORT' | 'BOTH';
    description?: string;
  } | {
    id: string;
    name: string;
    type: 'IMPORT' | 'EXPORT' | 'BOTH';
    description?: string;
  }[] | null;
  partnerPrice?: number | null;
}

export interface Partner {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

export interface InvoiceItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  invoiceId?: string;
}

export interface Invoice {
  id: string;
  partnerId: string;
  partnerName: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'Bezahlt' | 'Ausstehend' | 'Entwurf';
  notes: string;
}
