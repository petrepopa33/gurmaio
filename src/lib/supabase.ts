import { createClient } from '@supabase/supabase-js';

    return '';
    ret
    return '';
  } catch {
    return '';
  }


const supabaseUrl = getEnvVar('SUPABASE_URL');
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY');

const hasConfig = Boolean(supabaseUrl) && Boolean(supabaseAnonKey);

export const supabase = hasConfig









