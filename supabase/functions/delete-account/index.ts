// delete-account — fully purges the calling user's auth.users row, which
// CASCADE-deletes every row across goals / tasks / milestones / focus_sessions
// / journal_entries / profiles / push_subscriptions / notification_log via
// the foreign-key constraints already in place.
//
// Auth model: the gateway verifies the caller's JWT (verify_jwt = true). We
// then use auth.getUser(jwt) to read the user's identity from that JWT, and
// call admin.deleteUser with the service-role client. There's no path to
// delete a different user — we always operate on whoever owns the JWT.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...CORS },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!jwt) return json({ error: "missing_token" }, 401);

  // Resolve the JWT to a real user. Anon JWTs return user=null here, which is
  // exactly what we want — only logged-in users can delete themselves.
  const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
  if (userErr || !userData?.user) {
    return json({ error: "invalid_token" }, 401);
  }
  const userId = userData.user.id;

  // CASCADE handles every public.* table; this also revokes refresh tokens.
  const { error: deleteErr } = await admin.auth.admin.deleteUser(userId);
  if (deleteErr) {
    console.error("delete-account: deleteUser failed", deleteErr);
    return json({ error: "delete_failed", detail: deleteErr.message }, 500);
  }

  console.log("delete-account: purged user", userId);
  return json({ deleted: userId });
});
