"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { type Locale, LOCALES, t } from "@/lib/i18n";

type ThemeMode = "dark" | "light";

export default function GuidePage() {
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

  useEffect(() => { localStorage.setItem("enso-gw-locale", locale); }, [locale]);

  // removed nextLocale — using select dropdown instead

  const STEPS = [
    { num: "01", titleKey: "guide.step1.title", descKey: "guide.step1.desc", href: "/timer",   logo: <><circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.9" /><circle cx="50" cy="18" r="5" fill="currentColor" /></> },
    { num: "02", titleKey: "guide.step2.title", descKey: "guide.step2.desc", href: "/task",    logo: <><circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.9" /><polyline points="38,50 46,58 62,40" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></> },
    { num: "03", titleKey: "guide.step3.title", descKey: "guide.step3.desc", href: "/focus",   logo: <><circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.9" /><circle cx="50" cy="50" r="5" fill="currentColor" /></> },
    { num: "04", titleKey: "guide.step4.title", descKey: "guide.step4.desc", href: "/journal", logo: <><circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.9" /><line x1="38" y1="42" x2="62" y2="42" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.4" /><line x1="38" y1="50" x2="62" y2="50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.65" /><line x1="38" y1="58" x2="62" y2="58" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="1" /></> },
  ];

  const FEATURES = [
    { titleKey: "feature.free",    descKey: "feature.free.desc" },
    { titleKey: "feature.private", descKey: "feature.private.desc" },
    { titleKey: "feature.i18n",    descKey: "feature.i18n.desc" },
    { titleKey: "feature.theme",   descKey: "feature.theme.desc" },
    { titleKey: "feature.pwa",     descKey: "feature.pwa.desc" },
    { titleKey: "feature.offline", descKey: "feature.offline.desc" },
  ];

  const FAQ = [
    { qKey: "faq.data.q",         aKey: "faq.data.a" },
    { qKey: "faq.sync.q",         aKey: "faq.sync.a" },
    { qKey: "faq.taskjournal.q",   aKey: "faq.taskjournal.a" },
    { qKey: "faq.ai.q",           aKey: "faq.ai.a" },
    { qKey: "faq.flow.q",         aKey: "faq.flow.a" },
  ];

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-6 py-16 relative">
      {/* 右上: テーマ + 言語 */}
      <div className="fixed top-4 right-4 flex items-center gap-2 z-10">
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-8 h-8 rounded-full bg-card border border-card flex items-center justify-center text-muted hover:text-emerald-500 transition-colors">
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

      {/* ヘッダー */}
      <div className="text-center mb-16 animate-fade-in">
        <Link href="/dashboard" className="inline-block mb-8">
          <svg width={56} height={56} viewBox="0 0 100 100" fill="none" className="text-emerald-500">
            <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.9" />
          </svg>
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{t("guide.title", locale)}</h1>
        <p className="text-muted text-sm mt-3 max-w-md mx-auto whitespace-pre-line">{t("guide.subtitle", locale)}</p>
      </div>

      {/* サイクル図 */}
      <div className="text-center mb-16 animate-fade-in-delay-1">
        <div className="inline-flex items-center gap-3 text-sm text-muted flex-wrap justify-center">
          <span className="text-emerald-500 font-bold">TIMER</span><span>→</span>
          <span className="text-emerald-500 font-bold">TASK</span><span>→</span>
          <span className="text-emerald-500 font-bold">FOCUS</span><span>→</span>
          <span className="text-emerald-500 font-bold">JOURNAL</span><span>→</span>
          <span className="opacity-40">{t("guide.repeat", locale)}</span>
        </div>
      </div>

      {/* 4ステップ */}
      <section className="space-y-6 mb-20">
        <h2 className="text-lg font-bold mb-6">{t("guide.steps", locale)}</h2>
        {STEPS.map((step, i) => (
          <Link key={step.num} href={step.href} className="block bg-card border border-card rounded-2xl p-5 hover:border-emerald-500/20 transition-colors animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex items-start gap-4">
              <svg width={40} height={40} viewBox="0 0 100 100" fill="none" className="text-emerald-500 shrink-0">{step.logo}</svg>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-emerald-500 tabular-nums">{step.num}</span>
                  <h3 className="text-sm font-bold">{t(step.titleKey, locale)}</h3>
                </div>
                <p className="text-xs text-muted leading-relaxed">{t(step.descKey, locale)}</p>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* 特徴 */}
      <section className="mb-20">
        <h2 className="text-lg font-bold mb-6">{t("guide.features", locale)}</h2>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <div key={f.titleKey} className="bg-card border border-card rounded-2xl p-4">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <h3 className="text-sm font-bold mb-1">{t(f.titleKey, locale)}</h3>
              <p className="text-xs text-muted leading-relaxed">{t(f.descKey, locale)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ホーム画面追加 */}
      <section className="mb-20">
        <h2 className="text-lg font-bold mb-6">{t("pwa.title", locale)}</h2>
        <div className="bg-card border border-card rounded-2xl p-5 space-y-4">
          {["pwa.step1", "pwa.step2", "pwa.step3", "pwa.step4"].map((key, i) => (
            <div key={key} className="flex items-start gap-3">
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0">{i + 1}</span>
              <p className="text-sm">{t(key, locale)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-20">
        <h2 className="text-lg font-bold mb-6">{t("guide.faq", locale)}</h2>
        <div className="space-y-3">
          {FAQ.map((faq) => (
            <details key={faq.qKey} className="bg-card border border-card rounded-2xl p-4 group">
              <summary className="text-sm font-medium cursor-pointer list-none flex items-center justify-between">
                {t(faq.qKey, locale)}
                <span className="text-muted text-xs group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-muted mt-3 leading-relaxed">{t(faq.aKey, locale)}</p>
            </details>
          ))}
        </div>
      </section>

      {/* フッター */}
      <footer className="text-center space-y-4">
        <Link href="/dashboard" className="inline-block px-6 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors">
          {t("guide.start", locale)}
        </Link>
        <p className="text-xs text-muted">by CreativeStudio SHOTO.</p>
      </footer>
    </main>
  );
}
