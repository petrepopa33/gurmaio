import { createClient } from '@supabase/supabase-js';

    return import.meta.env[key] || '';
    ret
    return import.meta.env[key] || '';
  } catch {
    return '';
  }
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

const hasConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasConfig
      }
  : null;
export function getSupabaseSt
    hasUrl: Boolean(supabaseUrl
    con
}








