// notify-engine — sends Web Push reminders for upcoming goal deadlines.
//
// Triggered by pg_cron every 15 minutes. For each unachieved goal whose
// notify_timings include a trigger that landed inside the last 15-minute
// window, we:
//   1. Claim a row in notification_log (UNIQUE constraint dedupes retries)
//   2. Fan out the push to every push_subscription belonging to the user
//   3. Drop subscriptions that the push gateway has expired (410/404)
//
// The function is JWT-protected at the Supabase gateway. The pg_cron job
// authenticates with the service role key.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

// ---- Config ----
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:0sdm0.moriyama@gmail.com";

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.warn("notify-engine: VAPID keys missing — pushes will fail");
} else {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Mirror of NOTIFY_TIMING_MS from src/types/index.ts. Keep in sync.
const NOTIFY_TIMING_MS: Record<string, number> = {
  "2w": 14 * 86400000,
  "1w": 7 * 86400000,
  "3d": 3 * 86400000,
  "1d": 1 * 86400000,
  "1h": 3600000,
  "0": 0,
};

// Localized notification copy. Falls back to ja if the user's locale isn't here.
type Locale = "ja" | "en" | "zh" | "ko";
const COPY: Record<Locale, {
  titleDeadline: (goal: string) => string;
  titleBefore: (label: string, goal: string) => string;
  bodyDeadline: string;
  bodyBefore: (label: string) => string;
  labels: Record<string, string>;
}> = {
  ja: {
    titleDeadline: (g) => `期限: ${g}`,
    titleBefore: (l, g) => `${l}: ${g}`,
    bodyDeadline: "目標の期限です",
    bodyBefore: (l) => `期限まであと${l}`,
    labels: { "2w": "2週間", "1w": "1週間", "3d": "3日", "1d": "1日", "1h": "1時間", "0": "今" },
  },
  en: {
    titleDeadline: (g) => `Deadline: ${g}`,
    titleBefore: (l, g) => `${l}: ${g}`,
    bodyDeadline: "Your goal's deadline is here",
    bodyBefore: (l) => `${l} until deadline`,
    labels: { "2w": "2 weeks", "1w": "1 week", "3d": "3 days", "1d": "1 day", "1h": "1 hour", "0": "now" },
  },
  zh: {
    titleDeadline: (g) => `截止: ${g}`,
    titleBefore: (l, g) => `${l}: ${g}`,
    bodyDeadline: "目标已到截止时间",
    bodyBefore: (l) => `距截止还有 ${l}`,
    labels: { "2w": "2周", "1w": "1周", "3d": "3天", "1d": "1天", "1h": "1小时", "0": "现在" },
  },
  ko: {
    titleDeadline: (g) => `기한: ${g}`,
    titleBefore: (l, g) => `${l}: ${g}`,
    bodyDeadline: "목표의 기한이에요",
    bodyBefore: (l) => `기한까지 ${l} 남음`,
    labels: { "2w": "2주", "1w": "1주", "3d": "3일", "1d": "1일", "1h": "1시간", "0": "지금" },
  },
};

function copyFor(locale: string | null): typeof COPY["ja"] {
  if (locale === "en" || locale === "zh" || locale === "ko") return COPY[locale];
  return COPY.ja;
}

interface Goal {
  id: string;
  user_id: string;
  title: string;
  deadline: string;
  notify_timings: string[] | null;
}

interface Subscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

Deno.serve(async (_req: Request) => {
  const startedAt = Date.now();
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // matches the cron schedule

  // Pull every unachieved goal whose deadline is within the longest timing
  // window (2 weeks). Tiny dataset — RLS bypassed via service role.
  const horizon = new Date(now + 14 * 86400000 + windowMs).toISOString();
  const earliest = new Date(now - windowMs - 60_000).toISOString(); // 16 min ago floor
  const { data: goals, error } = await sb
    .from("goals")
    .select("id, user_id, title, deadline, notify_timings")
    .is("achieved_at", null)
    .lte("deadline", horizon)
    .gte("deadline", earliest);

  if (error) {
    console.error("notify-engine: failed to fetch goals", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  // Cache locales to avoid one query per goal.
  const userIds = Array.from(new Set((goals ?? []).map((g: Goal) => g.user_id)));
  let localeByUser: Record<string, string> = {};
  if (userIds.length) {
    const { data: profiles } = await sb
      .from("profiles")
      .select("user_id, locale")
      .in("user_id", userIds);
    for (const p of profiles ?? []) {
      localeByUser[p.user_id] = p.locale ?? "ja";
    }
  }

  let sent = 0;
  let skipped = 0;
  let cleaned = 0;
  let failed = 0;

  for (const goal of (goals ?? []) as Goal[]) {
    const deadlineMs = new Date(goal.deadline).getTime();
    const timings = goal.notify_timings ?? ["0"];

    for (const timing of timings) {
      const offset = NOTIFY_TIMING_MS[timing];
      if (offset === undefined) continue;

      const triggerMs = deadlineMs - offset;
      // Only fire if the trigger time landed in the last `windowMs`.
      // (now - windowMs <= triggerMs <= now)
      if (triggerMs > now) continue;
      if (now - triggerMs > windowMs) continue;

      // Claim the dedupe slot first — UNIQUE constraint stops us from
      // firing the same notification twice across overlapping cron runs.
      const { error: logErr } = await sb.from("notification_log").insert({
        user_id: goal.user_id,
        kind: "goal_deadline",
        ref_id: goal.id,
        ref_extra: timing,
      });
      if (logErr) {
        // Almost certainly a unique-violation — already sent.
        skipped++;
        continue;
      }

      // Fetch this user's subscriptions just-in-time.
      const { data: subs } = await sb
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth")
        .eq("user_id", goal.user_id);
      if (!subs?.length) continue;

      const c = copyFor(localeByUser[goal.user_id] ?? "ja");
      const isDeadline = timing === "0";
      const label = c.labels[timing] ?? timing;
      const payload = JSON.stringify({
        title: isDeadline ? c.titleDeadline(goal.title) : c.titleBefore(label, goal.title),
        body: isDeadline ? c.bodyDeadline : c.bodyBefore(label),
        url: "/dashboard",
        tag: `goal-${goal.id}-${timing}`,
      });

      for (const sub of subs as Subscription[]) {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload,
          );
          sent++;
        } catch (e) {
          // 410 Gone / 404 Not Found → endpoint expired. Drop the row so we
          // stop trying. Other errors stay logged but don't crash the loop.
          const status = (e as { statusCode?: number }).statusCode;
          if (status === 410 || status === 404) {
            await sb.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
            cleaned++;
          } else {
            failed++;
            console.warn("notify-engine: push failed", status, (e as Error).message);
          }
        }
      }
    }
  }

  const result = {
    elapsed_ms: Date.now() - startedAt,
    goals_scanned: goals?.length ?? 0,
    sent,
    skipped,
    cleaned,
    failed,
  };
  console.log("notify-engine:", JSON.stringify(result));
  return new Response(JSON.stringify(result), {
    headers: { "content-type": "application/json" },
  });
});
