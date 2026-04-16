"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { t } from "@/lib/i18n";
import { useAppShell } from "@/components/shared/AppShell";
import EnsoLogo from "@/components/shared/EnsoLogo";
import { ChevronLeftIcon } from "@/components/shared/Icons";

export default function SignInPage() {
  const { locale } = useAppShell();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      if (error) throw error;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <Link
        href="/dashboard"
        className="fixed top-4 left-4 flex items-center gap-1 text-muted hover:text-emerald-500 transition-colors"
        aria-label="Back"
      >
        <ChevronLeftIcon size={18} />
        <span className="text-xs">{t("auth.back", locale)}</span>
      </Link>

      <div className="w-full max-w-sm text-center">
        <EnsoLogo size={64} className="text-emerald-500 mx-auto mb-5" />
        <h1 className="text-2xl font-bold tracking-tight">{t("auth.signInTitle", locale)}</h1>
        <p className="text-xs text-muted mt-2 leading-relaxed">{t("auth.signInDesc", locale)}</p>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mt-8 bg-white hover:bg-gray-100 text-gray-900 font-medium text-sm py-3 px-5 rounded-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
        >
          <svg width={18} height={18} viewBox="0 0 48 48" aria-hidden>
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.4 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.3-.1-2.6-.4-3.9z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.4 5.1 29.5 3 24 3 16.3 3 9.7 7.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 45c5.4 0 10.2-2.1 13.9-5.5l-6.4-5.3C29.3 35.7 26.8 37 24 37c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.6 40.6 16.3 45 24 45z" />
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.4 5.3c-.4.4 7-5.1 7-14.9 0-1.3-.1-2.6-.6-3.9z" />
          </svg>
          {loading ? t("auth.signingIn", locale) : t("auth.googleSignIn", locale)}
        </button>

        {error && (
          <p className="text-xs text-red-400 mt-3">{error}</p>
        )}

        <p className="text-[10px] text-muted opacity-70 mt-8 leading-relaxed">
          {t("auth.privacyNote", locale)}
        </p>
      </div>
    </main>
  );
}
