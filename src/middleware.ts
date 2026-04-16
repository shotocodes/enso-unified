import { type NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSupabaseSession(request);
}

/**
 * Skip static assets and images. We still want this to run for API routes
 * and pages so the session cookie stays fresh.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon-192.png|icon-512.png|sw.js|sounds/|manifest.webmanifest).*)",
  ],
};
