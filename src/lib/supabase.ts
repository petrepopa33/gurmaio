import { createClient } from '@supabase/supabase-js';

function getEnv(key: string): string {
  if (typeof import.meta.env !== 'undefined') {

con
const hasCon
e

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

const hasConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
  };
    })
export { 

export { hasConfig };






