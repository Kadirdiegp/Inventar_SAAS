import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY || '';

// Singleton-Instanzen
let supabaseInstance: SupabaseClient | null = null;
let supabaseAdminInstance: SupabaseClient | null = null;

// Client für reguläre Benutzeroperationen
export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        storageKey: 'inventar-management-auth-user'
      }
    });
  }
  return supabaseInstance;
};

// Admin-Client für Operationen, die erhöhte Rechte benötigen
export const getSupabaseAdmin = (): SupabaseClient => {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        storageKey: 'inventar-management-auth-admin'
      }
    });
  }
  return supabaseAdminInstance;
};

// Für die Abwärtskompatibilität
export const supabase = getSupabase();
export const supabaseAdmin = getSupabaseAdmin();
