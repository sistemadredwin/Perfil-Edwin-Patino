import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase para lecturas públicas (usa la clave anon/publishable,
 * protegida por RLS). Devuelve null si faltan las variables de entorno; en ese
 * caso el sitio muestra datos de ejemplo.
 */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function failure(table: string, message: string): Error {
  return new Error(
    `Supabase (${table}): ${message}. ¿Ya ejecutaste supabase/schema.sql en el editor SQL de Supabase?`,
  );
}
