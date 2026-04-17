"use client";

import { useEffect, useState, useCallback, createContext, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  getTheme, saveTheme, getLocale, saveLocale,
  migrateLegacyStorage,
  setSyncUserId, performInitialSync, pullAll,
} from "@/lib/storage";
import { subscribeAll as subscribeRealtime } from "@/lib/store/realtime";
import { setLocale as setI18nLocale, type Locale } from "@/lib/i18n";
import type { ThemeMode } from "@/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import BottomNav from "./BottomNav";

// ================================================
// App Context: theme + locale + optional user
// ================================================

interface AppContextValue {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  locale: Locale;
  setLocale: (l: Locale) => void;
  mounted: boolean;
  user: User | null;
  authReady: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useAppShell(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppShell must be used inside <AppShell>");
  return ctx;
}

function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      : theme;
  document.documentElement.setAttribute("data-theme", resolved);
}

// Routes that should render WITHOUT bottom nav.
const NO_NAV_ROUTES = new Set(["/", "/guide", "/auth/sign-in"]);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [locale, setLocaleState] = useState<Locale>("ja");
  const [mounted, setMounted] = useState(false);

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Initial load (browser only)
  useEffect(() => {
    migrateLegacyStorage();
    const t = getTheme();
    const l = getLocale();
    setThemeState(t);
    setLocaleState(l);
    setI18nLocale(l);
    applyTheme(t);
    setMounted(true);

    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Auth: subscribe to session changes. Does nothing if env vars are missing.
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createSupabaseBrowserClient();
      // getSession reads the cookie directly — no network call, never throws on offline
      supabase.auth.getSession().then(({ data }) => {
        setUser(data.session?.user ?? null);
        setAuthReady(true);
      }).catch(() => setAuthReady(true));

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      return () => sub.subscription.unsubscribe();
    } else {
      setAuthReady(true);
    }
  }, []);

  // Theme change effect
  useEffect(() => {
    if (!mounted) return;
    applyTheme(theme);
    saveTheme(theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  // Locale change effect
  useEffect(() => {
    if (!mounted) return;
    setI18nLocale(locale);
    saveLocale(locale);
  }, [locale, mounted]);

  // Cloud sync: register user with storage dispatcher, run initial sync on sign-in
  useEffect(() => {
    if (!mounted || !authReady) return;
    setSyncUserId(user?.id ?? null);
    if (!user) return;

    let cancelled = false;
    (async () => {
      const result = await performInitialSync(user);
      if (cancelled) return;
      if (result.status === "downloaded") {
        // Cloud data was pulled into local — re-read locale/theme so UI matches
        setLocaleState(getLocale());
        setThemeState(getTheme());
      }
    })();
    return () => { cancelled = true; };
  }, [user, mounted, authReady]);

  // Cloud refresh on focus/visibility when signed in (catches writes missed while disconnected)
  useEffect(() => {
    if (!user || !mounted) return;
    const refresh = () => pullAll();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [user, mounted]);

  // Realtime subscription: changes on other tabs/devices flow in live
  useEffect(() => {
    if (!user || !mounted) return;
    const handle = subscribeRealtime(user.id);
    return () => handle.unsubscribe();
  }, [user, mounted]);

  const setTheme = useCallback((t: ThemeMode) => setThemeState(t), []);
  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);

  const value = useMemo<AppContextValue>(
    () => ({ theme, setTheme, locale, setLocale, mounted, user, authReady }),
    [theme, setTheme, locale, setLocale, mounted, user, authReady]
  );

  const showNav = !NO_NAV_ROUTES.has(pathname);

  return (
    <AppContext.Provider value={value}>
      <div className={showNav ? "pb-[calc(64px+env(safe-area-inset-bottom))]" : ""}>
        {children}
      </div>
      {showNav && mounted && <BottomNav locale={locale} />}
    </AppContext.Provider>
  );
}
