import { createClient } from '@supabase/supabase-js';

function getEnvVar(key: string): string {
  try {
    return import.meta.env[key] || '';
  } catch {
    return '';
  }
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

const hasConfig = Boolean(supabaseUrl) && Boolean(supabaseAnonKey);

export const supabase = hasConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = hasConfig;


n {

 Boolean(supabaseUrl),
: Boolean(supabaseAnonKey),
;













