import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Sichere Methode, um Fallback-Werte zu verbergen
const getSecureConfig = () => {
  // ACHTUNG: API-Keys sollten NIEMALS direkt im Quellcode gespeichert werden!
  // Verwenden Sie stattdessen Umgebungsvariablen (.env Datei)
  console.warn('WARNUNG: Fallback-Konfiguration wird verwendet. Bitte stellen Sie sicher, dass Sie die erforderlichen Umgebungsvariablen gesetzt haben.');
  
  const config = {
    url: 'https://vopxtqldmxwpmsoojdkg.supabase.co',
    anonKey: 'API-KEY_HIER_NICHT_DIREKT_EINGEBEN', // Ersetzen Sie durch Umgebungsvariable
    serviceKey: 'SERVICE-KEY_HIER_NICHT_DIREKT_EINGEBEN' // Ersetzen Sie durch Umgebungsvariable
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
