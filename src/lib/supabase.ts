import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  if (typeof import.meta.env !== 'undefined') {
    return import.meta.env[key] || '';
  }
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

const hasConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
      },
    })
  : null;

export const getSupabaseConfig = () => {
  return {
    url: supabaseUrl || 'Not configured',
    hasConfig,
  };
};

export const getSupabaseStatus = () => {
  return {
    configured: hasConfig,
    url: supabaseUrl || 'Not configured',
    hasKey: Boolean(supabaseAnonKey),
  };
};
