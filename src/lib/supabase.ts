import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Optional: only use this if needed (e.g., in logout)
export const clearInvalidTokens = () => {
  try {
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.refreshToken');
    localStorage.removeItem('supabase.auth.expires_at');
    localStorage.removeItem('supabase.auth.session');
    localStorage.removeItem(`sb-${supabaseUrl}-auth-token`);

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.includes('supabase.auth.') || key?.startsWith('sb-')) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error('Error clearing invalid tokens:', error);
  }
};

// Helper for public files
export const getPublicUrl = (filePath: string) => {
  const { data } = supabase.storage.from('space-images').getPublicUrl(filePath);
  return data.publicUrl;
};
