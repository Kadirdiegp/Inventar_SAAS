import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Fallback-Werte für den Fall, dass die Umgebungsvariablen nicht definiert sind
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://vopxtqldmxwpmsoojdkg.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvcHh0cWxkbXh3cG1zb29qZGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4ODA3NzgsImV4cCI6MjA1NzQ1Njc3OH0.R-PJ-BnBQ-p9JL04Kma4nhBnPTTpPrSTlPb6T5CI0CE';
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvcHh0cWxkbXh3cG1zb29qZGtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTg4MDc3OCwiZXhwIjoyMDU3NDU2Nzc4fQ.QstZgtAEV-OpIHueutZjUFQCKp1NzQxXR73PR182CL4';

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
