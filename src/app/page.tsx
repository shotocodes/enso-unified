"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { type Locale, LOCALES, t } from "@/lib/i18n";
import { APPS } from "@/lib/apps";

type ThemeMode = "dark" | "light";

export default function LandingPage() {
  const [locale, setLocale] = useState<Locale>("ja");
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    const savedLocale = localStorage.getItem("enso-gw-locale") as Locale | null;
    const savedTheme = localStorage.getItem("enso-gw-theme") as ThemeMode | null;
    if (savedLocale) setLocale(savedLocale);
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("enso-gw-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("enso-gw-locale", locale);
  }, [locale]);

  // Intersection Observer for scroll-triggered animations
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionCallback = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
            }
          });
        },
        { threshold: 0.15 }
      );
    }
    observerRef.current.observe(node);
  }, []);

  return (
    <div className="min-h-screen">
      {/* テーマ + 言語 */}
      <div className="fixed top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-8 h-8 rounded-full bg-card border border-card flex items-center justify-center text-muted hover:text-emerald-500 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
          ) : (
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          )}
        </button>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="h-8 px-2 rounded-full bg-card border border-card text-xs font-medium text-muted hover:text-emerald-500 transition-colors appearance-none cursor-pointer focus:outline-none"
          style={{ background: "var(--card)" }}
        >
          {LOCALES.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </div>

      {/* ━━ A. Hero ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="h-screen flex flex-col items-center justify-center px-6 relative">
        {/* Animated Enso brand mark */}
        <div className="relative w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] mb-6 select-none pointer-events-none">
          {/* Outer counter-rotating ring (decorative, subtle) */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full text-emerald-500/40 animate-enso-orbit-reverse"
            fill="none"
            aria-hidden
          >
            <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="0.3" strokeDasharray="0.5 1.5" />
          </svg>

          {/* The brushstroke logo, painted in by a conic mask */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/enso-mark.png"
            alt="ENSO"
            className="absolute inset-0 w-full h-full object-contain animate-enso-reveal"
            draggable={false}
          />

          {/* Inner orbiting particle: keeps the hero "alive" after the reveal completes */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full animate-enso-orbit"
            fill="none"
            aria-hidden
          >
            <circle cx="50" cy="6" r="1.1" fill="#10b981" opacity="0.9">
              <animate attributeName="opacity" values="0.9;0.3;0.9" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="94" r="0.7" fill="#10b981" opacity="0.5">
              <animate attributeName="opacity" values="0.5;0.15;0.5" dur="3s" begin="1.5s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        <h1 className="animate-fade-in text-5xl sm:text-7xl font-bold tracking-tight text-center">
          ENSO
        </h1>

        <p className="animate-fade-in-delay-1 text-muted text-base sm:text-lg mt-4 text-center max-w-md">
          {t("lp.tagline", locale)}
        </p>

        <Link
          href="/dashboard"
          className="animate-fade-in-delay-2 mt-10 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-sm rounded-xl transition-colors"
        >
          {t("lp.cta", locale)}
        </Link>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 animate-bounce-down">
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-muted">
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </div>
      </section>

      {/* ━━ B. Philosophy ━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section ref={sectionCallback} className="lp-section py-24 sm:py-32 px-6 flex flex-col items-center">
        <p className="text-center text-sm sm:text-base text-muted leading-relaxed whitespace-pre-line max-w-md">
          {t("lp.philosophy", locale)}
        </p>
      </section>

      {/* ━━ C. Ecosystem ━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section ref={sectionCallback} className="lp-section py-20 sm:py-28 px-6">
        <h2 className="text-center text-lg sm:text-xl font-bold mb-12">
          {t("lp.ecosystem", locale)}
        </h2>

        {/* App flow */}
        <div className="max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {APPS.map((app) => (
            <div key={app.name} className="flex flex-col items-center">
              <div className="bg-card border border-card rounded-2xl p-5 lp-card-glow w-full aspect-square flex flex-col items-center justify-center">
                <svg width={48} height={48} viewBox="0 0 100 100" fill="none" className="text-emerald-500 mb-3">
                  {app.logo}
                </svg>
                <p className="text-xs font-bold">{app.name}</p>
                <p className="text-[10px] text-muted mt-1 text-center leading-tight">
                  {t(app.taglineKey, locale)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted mt-8 tracking-wider">
          {t("lp.cycle", locale)}
        </p>
      </section>

      {/* ━━ D. Key Values ━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section ref={sectionCallback} className="lp-section py-20 sm:py-28 px-6">
        <h2 className="text-center text-lg sm:text-xl font-bold mb-10">
          {t("lp.values", locale)}
        </h2>

        <div className="max-w-lg mx-auto grid grid-cols-2 gap-6">
          {[
            { titleKey: "feature.free", descKey: "feature.free.desc" },
            { titleKey: "feature.private", descKey: "feature.private.desc" },
            { titleKey: "feature.offline", descKey: "feature.offline.desc" },
            { titleKey: "feature.i18n", descKey: "feature.i18n.desc" },
          ].map((f) => (
            <div key={f.titleKey} className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-sm font-bold">{t(f.titleKey, locale)}</p>
                <p className="text-xs text-muted mt-1 leading-relaxed">{t(f.descKey, locale)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ━━ E. CTA Footer ━━━━━━━━━━━━━━━━━━━━━━ */}
      <section ref={sectionCallback} className="lp-section py-24 sm:py-32 px-6 flex flex-col items-center">
        <Link
          href="/dashboard"
          className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-sm rounded-xl transition-colors"
        >
          {t("lp.cta", locale)}
        </Link>

        <div className="mt-6 text-center">
          <Link href="/guide" className="inline-flex items-center gap-2 px-5 py-2.5 bg-card border border-card rounded-xl text-xs text-muted hover:text-emerald-500 hover:border-emerald-500/20 transition-all">
            {t("home.guide", locale)}
          </Link>
        </div>

        <footer className="mt-16 text-center">
          <a
            href="https://www.shotomoriyama.com/links"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-muted hover:text-emerald-500 transition-colors"
          >
            <span>Built by</span>
            <span className="font-medium text-[var(--text)]">Shoto Moriyama</span>
          </a>
          <p className="text-[10px] text-muted mt-2 opacity-50">ensolife.app</p>
        </footer>
      </section>
    </div>
  );
}
