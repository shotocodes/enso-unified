"use client";

import { useEffect, useState, useCallback, createContext, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  getTheme, saveTheme, getLocale, saveLocale,
  migrateLegacyStorage,
} from "@/lib/storage";
import { setLocale as setI18nLocale, type Locale } from "@/lib/i18n";
import type { ThemeMode } from "@/types";
import BottomNav from "./BottomNav";

// ================================================
// Theme + Locale Context
// ================================================

interface AppContextValue {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  locale: Locale;
  setLocale: (l: Locale) => void;
  mounted: boolean;
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
// All other routes get the nav.
const NO_NAV_ROUTES = new Set(["/", "/guide"]);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [locale, setLocaleState] = useState<Locale>("ja");
  const [mounted, setMounted] = useState(false);

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

    // Register unified service worker (production only — avoids dev cache pain)
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  // Theme change effect
  useEffect(() => {
    if (!mounted) return;
    applyTheme(theme);
    saveTheme(theme);
  }, [theme, mounted]);

  // Listen for system theme changes when in "system" mode
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

  const setTheme = useCallback((t: ThemeMode) => setThemeState(t), []);
  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);

  const value = useMemo<AppContextValue>(
    () => ({ theme, setTheme, locale, setLocale, mounted }),
    [theme, setTheme, locale, setLocale, mounted]
  );

  const showNav = !NO_NAV_ROUTES.has(pathname);

  return (
    <AppContext.Provider value={value}>
      {/* Reserve space for bottom nav so content isn't covered */}
      <div className={showNav ? "pb-[calc(64px+env(safe-area-inset-bottom))]" : ""}>
        {children}
      </div>
      {showNav && mounted && <BottomNav locale={locale} />}
    </AppContext.Provider>
  );
}
