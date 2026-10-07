import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Configuration Supabase Client - Pure Broadcast (zéro persistance de données).
 *
 * Aucune session, aucun cookie, aucun token persistant en LocalStorage.
 * Uniquement des canaux WebSocket Broadcast en mémoire vive.
 */

const defaultSupabaseUrl = "https://elpnscywkpsljrxkluij.supabase.co";
const defaultSupabaseAnonKey =
  "sb_publishable_iPZOlCk9Rj1T6kWLBz8hbg_Od7Nt3Tz";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || defaultSupabaseUrl;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  defaultSupabaseAnonKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("https://") &&
    supabaseAnonKey.length > 20
);

export const CHANNELS = {
  REPORTS: "reports-stream",
  CORTEGE: "cortege-state",
} as const;

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }

  return supabaseInstance;
}
