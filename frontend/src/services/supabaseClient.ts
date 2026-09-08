import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase project URL from architecture configuration
const DEFAULT_SUPABASE_URL = 'https://cvjjumwflwjwqyqgymqs.supabase.co';

// Read from Vite environment or localStorage override
export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  (typeof window !== 'undefined' ? window.localStorage.getItem('MEDION_SUPABASE_URL') : null) ||
  DEFAULT_SUPABASE_URL;

export const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  (typeof window !== 'undefined' ? window.localStorage.getItem('MEDION_SUPABASE_KEY') : null) ||
  '';

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 10);
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return client;
}

export const supabase = getSupabaseClient();
