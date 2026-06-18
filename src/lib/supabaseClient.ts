import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function hasRealValue(value: string | undefined): value is string {
  return Boolean(value && value.trim().length > 0 && !value.includes("your_"));
}

export const isSupabaseConfigured = hasRealValue(supabaseUrl) && hasRealValue(supabaseAnonKey);

function createSupabaseClient(): SupabaseClient | null {
  if (!hasRealValue(supabaseUrl) || !hasRealValue(supabaseAnonKey)) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabase: SupabaseClient | null = createSupabaseClient();
