import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const adminClient =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

export const supabaseAdmin = adminClient;

export function requireAdmin() {
  if (!adminClient) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured. Order operations will fail.");
  }
  return adminClient;
}

export const supabaseConfigError =
  !supabaseUrl || !supabaseAnonKey ? "Supabase env vars are missing" : null;
