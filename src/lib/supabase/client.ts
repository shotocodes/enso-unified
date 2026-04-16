"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in client components.
 * Uses the publishable anon key — safe to expose to the browser.
 * All writes still require an authenticated session + RLS check.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
