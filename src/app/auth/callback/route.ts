import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * OAuth callback — Supabase redirects here after the user approves on Google.
 * We exchange the `code` for a session, set cookies on the redirect response,
 * then send the user to `next` (default: /dashboard).
 *
 * Why inline the Supabase client here instead of using the shared helper?
 * Route Handlers need cookies set on the *response* object so the browser
 * receives them via Set-Cookie. Using `cookies().set()` and then returning
 * a fresh `NextResponse.redirect()` drops those cookies on Next.js 16.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/auth/sign-in?error=nocode", url.origin));
  }

  // Prepare the redirect response up front so Supabase can attach cookies to it
  const response = NextResponse.redirect(new URL(next, url.origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
    return NextResponse.redirect(new URL(`/auth/sign-in?error=${encodeURIComponent(error.message)}`, url.origin));
  }

  return response;
}
