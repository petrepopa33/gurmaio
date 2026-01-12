import { createClient } from '@supabase/supabase-js';

function getEnvVar(key: string): string {
  if (typeof import.meta.env !== 'undefined' && import.meta.env[key]) {
    return import.meta.env[key] || '';
  }
  return '';
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

const isValidKey = supabaseAnonKey && supabaseAnonKey.length > 20;
const hasConfig = !!(supabaseUrl && isValidKey);

if (!hasConfig) {
  console.warn('Supabase is not configured. Some features may be limited.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

export function checkSupabaseConfig(): boolean {
  return hasConfig;
}

export function getSupabaseStatus(): { configured: boolean; url: string; hasKey: boolean } {
  return {
    configured: hasConfig,
    url: supabaseUrl || 'Not configured',
    hasKey: !!isValidKey,
  };
}
