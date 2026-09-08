import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase project URL and public Anon key from architecture configuration
const DEFAULT_SUPABASE_URL = 'https://cvjjumwflwjwqyqgymqs.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2amp1bXdmbHdqd3F5cWd5bXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NTQyNzYsImV4cCI6MjEwNDQzMDI3Nn0.Py3XfBECSbqlIFXhv_CKF5qkB0ibsoDtgJl5rZ_6c0g';

// Read from Vite environment or localStorage override
export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  (typeof window !== 'undefined' ? window.localStorage.getItem('MEDION_SUPABASE_URL') : null) ||
  DEFAULT_SUPABASE_URL;

export const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  (typeof window !== 'undefined' ? window.localStorage.getItem('MEDION_SUPABASE_KEY') : null) ||
  DEFAULT_SUPABASE_ANON_KEY;

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
