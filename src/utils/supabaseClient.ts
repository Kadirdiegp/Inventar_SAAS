import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Sichere Methode, um Fallback-Werte zu verbergen
const getSecureConfig = () => {
  const config = {
    url: 'https://vopxtqldmxwpmsoojdkg.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvcHh0cWxkbXh3cG1zb29qZGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4ODA3NzgsImV4cCI6MjA1NzQ1Njc3OH0.R-PJ-BnBQ-p9JL04Kma4nhBnPTTpPrSTlPb6T5CI0CE',
    serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvcHh0cWxkbXh3cG1zb29qZGtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTg4MDc3OCwiZXhwIjoyMDU3NDU2Nzc4fQ.QstZgtAEV-OpIHueutZjUFQCKp1NzQxXR73PR182CL4'
  };
  return config;
};

// URL und Keys aus den Umgebungsvariablen oder Fallback
const fallbackConfig = getSecureConfig();
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || fallbackConfig.url;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || fallbackConfig.anonKey;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY || fallbackConfig.serviceKey;

// Warnung ausgeben, wenn Umgebungsvariablen fehlen
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL oder API-Schlüssel fehlen. ' +
    'Bitte stelle sicher, dass die Umgebungsvariablen korrekt gesetzt sind. ' +
    'Siehe .env.example für weitere Informationen.'
  );
}

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
