import { supabase, supabaseAdmin } from '../utils/supabaseClient';
import { Invoice, InvoiceItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Alle Rechnungen abrufen
export const fetchInvoices = async (): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Fehler beim Abrufen der Rechnungen:', error);
    throw error;
  }

  const invoices: Invoice[] = [];

  // Für jede Rechnung die zugehörigen Rechnungspositionen abrufen
  for (const invoice of data) {
    const { data: itemsData, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoice.id);

    if (itemsError) {
      console.error(`Fehler beim Abrufen der Rechnungspositionen für Rechnung ${invoice.id}:`, itemsError);
      continue;
    }

    // Konvertiere Supabase-Datenformat zu unserem App-Format für Rechnungspositionen
    const items: InvoiceItem[] = itemsData.map(item => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      total: item.total
    }));

    // Füge die vollständige Rechnung zum Array hinzu
    invoices.push({
      id: invoice.id,
      partnerId: invoice.partner_id,
      partnerName: invoice.partner_name,
      date: invoice.date,
      items: items,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      status: invoice.status,
      notes: invoice.notes
    });
  }

  return invoices;
};

// Eine Rechnung abrufen
export const fetchInvoiceById = async (id: string): Promise<Invoice | null> => {
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Fehler beim Abrufen der Rechnung mit ID ${id}:`, error);
    return null;
  }

  if (!invoice) return null;

  // Rechnungspositionen abrufen
  const { data: itemsData, error: itemsError } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', id);

  if (itemsError) {
    console.error(`Fehler beim Abrufen der Rechnungspositionen für Rechnung ${id}:`, itemsError);
    return null;
  }

  // Konvertiere Supabase-Datenformat zu unserem App-Format für Rechnungspositionen
  const items: InvoiceItem[] = itemsData.map(item => ({
    id: item.id,
    productId: item.product_id,
    productName: item.product_name,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    total: item.total
  }));

  // Vollständige Rechnung zurückgeben
  return {
    id: invoice.id,
    partnerId: invoice.partner_id,
    partnerName: invoice.partner_name,
    date: invoice.date,
    items: items,
    subtotal: invoice.subtotal,
    tax: invoice.tax,
    total: invoice.total,
    status: invoice.status,
    notes: invoice.notes
  };
};

// Neue Rechnung erstellen
export const createInvoice = async (invoice: Omit<Invoice, 'id'>): Promise<Invoice> => {
  const now = new Date().toISOString();
  const newInvoiceId = uuidv4();
  
  // Hauptdaten der Rechnung einfügen
  const { error: invoiceError } = await supabaseAdmin
    .from('invoices')
    .insert([{
      id: newInvoiceId,
      partner_id: invoice.partnerId,
      partner_name: invoice.partnerName,
      date: invoice.date,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      status: invoice.status,
      notes: invoice.notes,
      created_at: now,
      updated_at: now
    }]);

  if (invoiceError) {
    console.error('Fehler beim Erstellen der Rechnung:', invoiceError);
    throw invoiceError;
  }

  // Rechnungspositionen einfügen
  const invoiceItems = invoice.items.map(item => ({
    id: uuidv4(),
    invoice_id: newInvoiceId,
    product_id: item.productId,
    product_name: item.productName,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total: item.total,
    created_at: now
  }));

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(invoiceItems);

  if (itemsError) {
    console.error('Fehler beim Erstellen der Rechnungspositionen:', itemsError);
    // Rollback: Lösche die Hauptrechnung, wenn die Positionen nicht erstellt werden konnten
    await supabaseAdmin.from('invoices').delete().eq('id', newInvoiceId);
    throw itemsError;
  }

  // Vollständige Rechnung zurückgeben
  return {
    id: newInvoiceId,
    ...invoice
  };
};

// Rechnung aktualisieren
export const updateInvoice = async (invoice: Invoice): Promise<Invoice> => {
  const now = new Date().toISOString();
  
  // Hauptdaten der Rechnung aktualisieren
  const { error: invoiceError } = await supabaseAdmin
    .from('invoices')
    .update({
      partner_id: invoice.partnerId,
      partner_name: invoice.partnerName,
      date: invoice.date,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      status: invoice.status,
      notes: invoice.notes,
      updated_at: now
    })
    .eq('id', invoice.id);

  if (invoiceError) {
    console.error(`Fehler beim Aktualisieren der Rechnung mit ID ${invoice.id}:`, invoiceError);
    throw invoiceError;
  }

  // Bestehende Rechnungspositionen löschen
  const { error: deleteError } = await supabaseAdmin
    .from('invoice_items')
    .delete()
    .eq('invoice_id', invoice.id);

  if (deleteError) {
    console.error(`Fehler beim Löschen der Rechnungspositionen für Rechnung ${invoice.id}:`, deleteError);
    throw deleteError;
  }

  // Neue Rechnungspositionen einfügen
  const invoiceItems = invoice.items.map(item => ({
    id: uuidv4(),
    invoice_id: invoice.id,
    product_id: item.productId,
    product_name: item.productName,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total: item.total,
    created_at: now
  }));

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(invoiceItems);

  if (itemsError) {
    console.error(`Fehler beim Aktualisieren der Rechnungspositionen für Rechnung ${invoice.id}:`, itemsError);
    throw itemsError;
  }

  return invoice;
};

// Rechnung löschen
export const deleteInvoice = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Fehler beim Löschen der Rechnung mit ID ${id}:`, error);
    throw error;
  }
};

// Alle Rechnungspositionen abrufen
export const fetchInvoiceItems = async (): Promise<InvoiceItem[]> => {
  const { data, error } = await supabase
    .from('invoice_items')
    .select('*');

  if (error) {
    console.error('Fehler beim Abrufen der Rechnungspositionen:', error);
    throw error;
  }

  // Konvertiere Supabase-Datenformat zu unserem App-Format für Rechnungspositionen
  const items: InvoiceItem[] = data.map(item => ({
    id: item.id,
    productId: item.product_id,
    productName: item.product_name,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    total: item.total,
    invoiceId: item.invoice_id
  }));

  return items;
};

// Rechnungen für einen bestimmten Partner abrufen
export const fetchInvoicesByPartner = async (partnerId: string): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('partner_id', partnerId)
    .order('date', { ascending: false });

  if (error) {
    console.error(`Fehler beim Abrufen der Rechnungen für Partner ${partnerId}:`, error);
    throw error;
  }

  const invoices: Invoice[] = [];

  // Für jede Rechnung die zugehörigen Rechnungspositionen abrufen
  for (const invoice of data || []) {
    const { data: itemsData, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoice.id);

    if (itemsError) {
      console.error(`Fehler beim Abrufen der Rechnungspositionen für Rechnung ${invoice.id}:`, itemsError);
      continue;
    }

    // Konvertiere Supabase-Datenformat zu unserem App-Format für Rechnungspositionen
    const items: InvoiceItem[] = (itemsData || []).map(item => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      total: item.total
    }));

    // Füge die vollständige Rechnung zum Array hinzu
    invoices.push({
      id: invoice.id,
      partnerId: invoice.partner_id,
      partnerName: invoice.partner_name,
      date: invoice.date,
      items: items,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      status: invoice.status,
      notes: invoice.notes
    });
  }

  return invoices;
};
