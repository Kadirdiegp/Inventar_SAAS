import { supabase } from '../utils/supabaseClient';
import { Partner } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Alle Partner abrufen
export const fetchPartners = async (): Promise<Partner[]> => {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('name');

  if (error) {
    console.error('Fehler beim Abrufen der Partner:', error);
    throw error;
  }

  // Konvertiere Supabase-Datenformat zu unserem App-Format
  return data.map(item => ({
    id: item.id,
    name: item.name,
    contact: item.contact,
    email: item.email,
    phone: item.phone,
    address: item.address,
    notes: item.notes
  }));
};

// Einen Partner abrufen
export const fetchPartnerById = async (id: string): Promise<Partner | null> => {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Fehler beim Abrufen des Partners mit ID ${id}:`, error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    contact: data.contact,
    email: data.email,
    phone: data.phone,
    address: data.address,
    notes: data.notes
  };
};

// Neuen Partner erstellen
export const createPartner = async (partner: Omit<Partner, 'id'>): Promise<Partner> => {
  const now = new Date().toISOString();
  const newPartner = {
    id: uuidv4(),
    name: partner.name,
    contact: partner.contact,
    email: partner.email,
    phone: partner.phone,
    address: partner.address,
    notes: partner.notes,
    created_at: now,
    updated_at: now
  };

  const { data, error } = await supabase
    .from('partners')
    .insert([newPartner])
    .select()
    .single();

  if (error) {
    console.error('Fehler beim Erstellen des Partners:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    contact: data.contact,
    email: data.email,
    phone: data.phone,
    address: data.address,
    notes: data.notes
  };
};

// Partner aktualisieren
export const updatePartner = async (partner: Partner): Promise<Partner> => {
  const { data, error } = await supabase
    .from('partners')
    .update({
      name: partner.name,
      contact: partner.contact,
      email: partner.email,
      phone: partner.phone,
      address: partner.address,
      notes: partner.notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', partner.id)
    .select()
    .single();

  if (error) {
    console.error(`Fehler beim Aktualisieren des Partners mit ID ${partner.id}:`, error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    contact: data.contact,
    email: data.email,
    phone: data.phone,
    address: data.address,
    notes: data.notes
  };
};

// Prüfen, ob ein Partner mit Rechnungen verknüpft ist
export const checkPartnerHasInvoices = async (partnerId: string): Promise<boolean> => {
  const { data, error, count } = await supabase
    .from('invoices')
    .select('id', { count: 'exact' })
    .eq('partnerId', partnerId);

  if (error) {
    console.error(`Fehler beim Prüfen, ob Partner mit ID ${partnerId} Rechnungen hat:`, error);
    throw error;
  }

  return (count || 0) > 0;
};

// Partner löschen
export const deletePartner = async (id: string): Promise<void> => {
  // Zuerst prüfen, ob der Partner mit Rechnungen verknüpft ist
  const hasInvoices = await checkPartnerHasInvoices(id);
  
  if (hasInvoices) {
    throw new Error('Der Partner kann nicht gelöscht werden, da er noch mit Rechnungen verknüpft ist. Bitte löschen Sie zuerst alle zugehörigen Rechnungen.');
  }

  const { error } = await supabase
    .from('partners')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Fehler beim Löschen des Partners mit ID ${id}:`, error);
    throw error;
  }
};
