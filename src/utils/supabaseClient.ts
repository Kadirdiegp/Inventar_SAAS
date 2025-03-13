import { createClient } from '@supabase/supabase-js';

// Direkte Konfiguration der Supabase-Verbindung
const supabaseUrl = 'https://vopxtqldmxwpmsoojdkg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvcHh0cWxkbXh3cG1zb29qZGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4ODA3NzgsImV4cCI6MjA1NzQ1Njc3OH0.R-PJ-BnBQ-p9JL04Kma4nhBnPTTpPrSTlPb6T5CI0CE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
