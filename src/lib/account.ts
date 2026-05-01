"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { disablePush } from "@/lib/push";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/**
 * Permanently deletes the signed-in user's account.
 *
 * Order matters here:
 *   1. Unsubscribe push first — once auth.users is gone, the row is dropped via
 *      CASCADE anyway, but we still want the browser to forget its endpoint
 *      so the OS push permission settings reflect reality.
 *   2. Call the delete-account Edge Function with the user's JWT. The function
 *      verifies the JWT, then admin-deletes the auth.users row server-side.
 *      All public.* rows are wiped via the existing ON DELETE CASCADE FKs.
 *   3. Clear local storage and sign out so this device doesn't try to use a
 *      stale session.
 */
export async function deleteAccount(): Promise<{ ok: true } | { ok: false; reason: string }> {
  const supabase = createSupabaseBrowserClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) return { ok: false, reason: "not-signed-in" };

  // Best-effort: drop the push subscription so the browser/SW state matches.
  try {
    await disablePush(session.user.id);
  } catch {
    // Non-fatal — even if this fails, the CASCADE on auth.users will purge
    // push_subscriptions on the server side.
  }

  let response: Response;
  try {
    response = await fetch(`${SUPABASE_URL}/functions/v1/delete-account`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    });
  } catch (e) {
    return { ok: false, reason: (e as Error).message || "network" };
  }

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.error ?? body?.detail ?? "";
    } catch { /* ignore */ }
    return { ok: false, reason: detail || `http_${response.status}` };
  }

  // Wipe every "enso-" key so reloading the page doesn't replay the old data
  // through the dual-write store. Anything outside this prefix is left alone.
  if (typeof localStorage !== "undefined") {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("enso-")) keys.push(k);
    }
    for (const k of keys) localStorage.removeItem(k);
  }

  // Sign out clears the auth cookie so middleware sees the user as logged out.
  await supabase.auth.signOut().catch(() => {});

  return { ok: true };
}
