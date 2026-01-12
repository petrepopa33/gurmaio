import { createClient } from '@supabase/supabase-js';

function getEnv(key: string): string {
  if (typeof import.meta.env !== 'undefined') {
    return import.meta.env[key] || '';
  }
  return '';
}

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

const hasConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

export function checkSupabaseConfig(): boolean {
  return hasConfig;
}

export function getSupabaseStatus(): { configured: boolean; url: string; hasKey: boolean } {
  return {
    configured: hasConfig,
    url: supabaseUrl || 'Not configured',
    hasKey: Boolean(supabaseAnonKey)
  };
}
