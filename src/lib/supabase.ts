import { createClient } from '@supabase/supabase-js';

function getEnvVar(key: string): string {
  try {
    return '';
  } catch {
    return '';
  }
}

const supabaseUrl = getEnvVar('SUPABASE_URL');
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY');

const hasConfig = Boolean(supabaseUrl) && Boolean(supabaseAnonKey);

export const supabase = hasConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function getSupabaseStatus() {
  return {
    hasUrl: Boolean(supabaseUrl),
    hasAnonKey: Boolean(supabaseAnonKey),
    configured: hasConfig
  };
}