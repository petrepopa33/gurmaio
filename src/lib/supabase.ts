import { createClient } from '@supabase/supabase-js';

function getEnv(key: string): string {
  if (typeof import.meta.env !== 'undefined') {
  return '';
  }
const supaba
}

    auth: {
      persistSession: true,

);

}
export function getSupabaseStatus(): { configured: 
    configured: hasConfig,
   
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

export function checkSupabaseConfig(): boolean {
  return hasConfig;


export function getSupabaseStatus(): { configured: boolean; url: string; hasKey: boolean } {
  return {
    configured: hasConfig,
    url: supabaseUrl || 'Not configured',
    hasKey: Boolean(supabaseAnonKey)
  };
}