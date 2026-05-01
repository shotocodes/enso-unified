"use client";

// Web Push subscription helpers.
// Saves the browser's pushManager.subscribe() output to Supabase so the
// notify-engine Edge Function can target this device.

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

export type PushSupport =
  | { supported: true; permission: NotificationPermission }
  | { supported: false; reason: "no-sw" | "no-push" | "no-notification" | "no-vapid" };

export function detectPushSupport(): PushSupport {
  if (typeof window === "undefined") return { supported: false, reason: "no-sw" };
  if (!("serviceWorker" in navigator)) return { supported: false, reason: "no-sw" };
  if (!("PushManager" in window)) return { supported: false, reason: "no-push" };
  if (!("Notification" in window)) return { supported: false, reason: "no-notification" };
  if (!VAPID_PUBLIC_KEY) return { supported: false, reason: "no-vapid" };
  return { supported: true, permission: Notification.permission };
}

function urlBase64ToBuffer(base64: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  const buffer = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
  return buffer;
}

async function getRegistration(): Promise<ServiceWorkerRegistration> {
  const reg = await navigator.serviceWorker.ready;
  return reg;
}

function deviceLabel(): string {
  if (typeof navigator === "undefined") return "unknown";
  // Crude UA parsing — just enough to recognize "iPhone Safari" vs "Chrome on Mac" later.
  const ua = navigator.userAgent;
  const platform = /iPhone|iPad|iPod/.test(ua) ? "iOS" :
                   /Android/.test(ua) ? "Android" :
                   /Macintosh/.test(ua) ? "Mac" :
                   /Windows/.test(ua) ? "Windows" :
                   /Linux/.test(ua) ? "Linux" : "Other";
  const browser = /Edg\//.test(ua) ? "Edge" :
                  /Chrome\//.test(ua) ? "Chrome" :
                  /Firefox\//.test(ua) ? "Firefox" :
                  /Safari\//.test(ua) ? "Safari" : "Browser";
  return `${browser} / ${platform}`;
}

/** Subscribe the current device for push and persist to Supabase. Idempotent. */
export async function enablePush(userId: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const support = detectPushSupport();
  if (!support.supported) return { ok: false, reason: support.reason };

  if (Notification.permission === "denied") {
    return { ok: false, reason: "permission-denied" };
  }
  if (Notification.permission === "default") {
    const result = await Notification.requestPermission();
    if (result !== "granted") return { ok: false, reason: "permission-denied" };
  }

  const reg = await getRegistration();
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToBuffer(VAPID_PUBLIC_KEY),
    });
  }

  const json = sub.toJSON();
  const endpoint = sub.endpoint;
  const p256dh = json.keys?.p256dh ?? "";
  const auth = json.keys?.auth ?? "";
  if (!endpoint || !p256dh || !auth) return { ok: false, reason: "invalid-subscription" };

  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: userId,
        endpoint,
        p256dh,
        auth,
        device_label: deviceLabel(),
        last_used_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" },
    );
  if (error) return { ok: false, reason: error.message };

  // Flip the profile flag so the notify-engine knows this user opted in.
  const { error: profileErr } = await supabase
    .from("profiles")
    .update({ push_enabled: true })
    .eq("user_id", userId);
  if (profileErr) return { ok: false, reason: profileErr.message };

  return { ok: true };
}

/** Unsubscribe this device, remove the row, and flip push_enabled off if no other devices remain. */
export async function disablePush(userId: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const support = detectPushSupport();
  if (!support.supported) return { ok: false, reason: support.reason };

  const reg = await getRegistration();
  const sub = await reg.pushManager.getSubscription();
  const supabase = createSupabaseBrowserClient();

  if (sub) {
    const endpoint = sub.endpoint;
    await sub.unsubscribe();
    await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  }

  // If no other devices remain, flip the global flag off.
  const { count } = await supabase
    .from("push_subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  if (!count || count === 0) {
    await supabase.from("profiles").update({ push_enabled: false }).eq("user_id", userId);
  }

  return { ok: true };
}

/** Quick check: is this device already subscribed? */
export async function isPushSubscribed(): Promise<boolean> {
  const support = detectPushSupport();
  if (!support.supported) return false;
  if (Notification.permission !== "granted") return false;
  try {
    const reg = await getRegistration();
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  } catch {
    return false;
  }
}
