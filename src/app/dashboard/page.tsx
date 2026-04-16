"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { t } from "@/lib/i18n";
import {
  getFocusTodayMinutes,
  getFocusStreak,
  getTaskStats,
  getActiveGoalsInfo,
  getJournalToday,
  hasAnyData,
  shouldShowBackupReminder,
  dismissBackupReminder,
  type GoalInfo,
} from "@/lib/storage";
import { useAppShell } from "@/components/shared/AppShell";
import PageHeader from "@/components/shared/PageHeader";

const MOOD_LABELS: Record<number, string> = {
  1: "Bad",
  2: "Low",
  3: "OK",
  4: "Good",
  5: "Great",
};

const ONBOARD_STEPS = [
  {
    num: "1", titleKey: "onboard.step1", descKey: "onboard.step1.desc", href: "/timer",
    icon: (
      <svg width={20} height={20} viewBox="0 0 100 100" fill="none" className="text-emerald-500">
        <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.9" />
        <circle cx="50" cy="18" r="5" fill="currentColor" />
      </svg>
    ),
  },
  {
    num: "2", titleKey: "onboard.step2", descKey: "onboard.step2.desc", href: "/task",
    icon: (
      <svg width={20} height={20} viewBox="0 0 100 100" fill="none" className="text-emerald-500">
        <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.9" />
        <polyline points="40,50 48,58 62,42" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    num: "3", titleKey: "onboard.step3", descKey: "onboard.step3.desc", href: "/focus",
    icon: (
      <svg width={20} height={20} viewBox="0 0 100 100" fill="none" className="text-emerald-500">
        <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.9" />
        <circle cx="50" cy="50" r="5" fill="currentColor" />
      </svg>
    ),
  },
];

export default function Dashboard() {
  const { locale, mounted } = useAppShell();

  const [isNewUser, setIsNewUser] = useState(false);
  const [focusMin, setFocusMin] = useState(0);
  const [streak, setStreak] = useState(0);
  const [taskStats, setTaskStats] = useState({ active: 0, completedToday: 0 });
  const [goals, setGoals] = useState<GoalInfo[]>([]);
  const [journal, setJournal] = useState({ entries: 0, mood: null as number | null });
  const [showBackup, setShowBackup] = useState(false);

  const loadData = useCallback(() => {
    setFocusMin(Math.round(getFocusTodayMinutes()));
    setStreak(getFocusStreak());
    setTaskStats(getTaskStats());
    setGoals(getActiveGoalsInfo());
    setJournal(getJournalToday());
    setIsNewUser(!hasAnyData());
    setShowBackup(shouldShowBackupReminder());
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Reload on tab focus
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") loadData();
    };
    window.addEventListener("focus", loadData);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", loadData);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [loadData]);

  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <PageHeader title="ENSO" subtitle={t("home.subtitle", locale)} />

      <div className="space-y-5">
        {/* Backup reminder */}
        {mounted && showBackup && !isNewUser && (
          <div className="animate-fade-in flex items-center gap-3 bg-card border border-amber-500/20 rounded-xl px-4 py-3">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={2} strokeLinecap="round" className="shrink-0">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">{t("backup.title", locale)}</p>
              <p className="text-[10px] text-muted mt-0.5">{t("backup.desc", locale)}</p>
            </div>
            <button
              onClick={() => { dismissBackupReminder(); setShowBackup(false); }}
              className="text-xs text-muted hover:text-emerald-500 font-medium shrink-0 px-2 py-1 rounded-lg hover:bg-subtle transition-all"
            >
              {t("backup.dismiss", locale)}
            </button>
          </div>
        )}

        {/* Welcome (new user) */}
        {mounted && isNewUser ? (
          <section className="animate-fade-in-delay-1">
            <div className="bg-card border border-card rounded-2xl p-6 sm:p-8">
              <div className="text-center mb-6">
                <svg width={48} height={48} viewBox="0 0 100 100" fill="none" className="text-emerald-500 mx-auto mb-3">
                  <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.9" className="animate-draw-circle" />
                </svg>
                <h2 className="text-lg font-bold">{t("onboard.welcome", locale)}</h2>
                <p className="text-xs text-muted mt-1">{t("onboard.subtitle", locale)}</p>
              </div>

              <div className="space-y-3">
                {ONBOARD_STEPS.map((step) => (
                  <Link
                    key={step.num}
                    href={step.href}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-emerald-500/5 hover:border-emerald-500/20 border border-transparent transition-all"
                  >
                    <span className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      {step.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{t(step.titleKey, locale)}</p>
                      <p className="text-[11px] text-muted mt-0.5 leading-relaxed">{t(step.descKey, locale)}</p>
                    </div>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="text-muted shrink-0">
                      <polyline points="9,18 15,12 9,6" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Today */}
            <section className="animate-fade-in-delay-1">
              <h2 className="text-xs font-bold text-muted uppercase tracking-widest mb-3">
                {t("dash.today", locale)}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/focus" className="bg-card border border-card rounded-2xl p-4 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={2.5} strokeLinecap="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>
                    </span>
                    <span className="text-xs font-medium text-muted">{t("dash.focus", locale)}</span>
                  </div>
                  <p className="text-2xl font-bold tabular-nums">
                    {mounted ? focusMin : "—"}<span className="text-xs font-normal text-muted ml-1">{t("dash.min", locale)}</span>
                  </p>
                  {mounted && streak > 0 && (
                    <p className="text-[10px] text-emerald-500 mt-1">{streak}{t("dash.days", locale)} {t("dash.streak", locale)}</p>
                  )}
                </Link>

                <Link href="/task" className="bg-card border border-card rounded-2xl p-4 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="9,11 12,14 22,4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                    </span>
                    <span className="text-xs font-medium text-muted">{t("dash.tasks", locale)}</span>
                  </div>
                  <p className="text-2xl font-bold tabular-nums">
                    {mounted ? taskStats.completedToday : "—"}
                    <span className="text-xs font-normal text-muted ml-1">{t("dash.done", locale)}</span>
                  </p>
                  {mounted && taskStats.active > 0 && (
                    <p className="text-[10px] text-muted mt-1">{taskStats.active} {t("dash.active", locale)}</p>
                  )}
                </Link>

                <Link href="/journal" className="bg-card border border-card rounded-2xl p-4 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={2.5} strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /></svg>
                    </span>
                    <span className="text-xs font-medium text-muted">{t("dash.journal", locale)}</span>
                  </div>
                  <p className="text-2xl font-bold tabular-nums">
                    {mounted ? journal.entries : "—"}
                    <span className="text-xs font-normal text-muted ml-1">{t("dash.entries", locale)}</span>
                  </p>
                </Link>

                <Link href="/journal" className="bg-card border border-card rounded-2xl p-4 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={2.5} strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /></svg>
                    </span>
                    <span className="text-xs font-medium text-muted">{t("dash.mood", locale)}</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {mounted ? (journal.mood ? MOOD_LABELS[journal.mood] : "—") : "—"}
                  </p>
                </Link>
              </div>
            </section>

            {/* Goals */}
            <section className="animate-fade-in-delay-2">
              <h2 className="text-xs font-bold text-muted uppercase tracking-widest mb-3">
                {t("dash.goals", locale)}
              </h2>
              {mounted && goals.length > 0 ? (
                <div className="space-y-2">
                  {goals.slice(0, 5).map((g, i) => (
                    <Link key={i} href="/timer" className="flex items-center justify-between bg-card border border-card rounded-xl px-4 py-3 hover:border-emerald-500/30 transition-all">
                      <span className="text-sm font-medium truncate mr-3">{g.title}</span>
                      <span className="text-xs text-muted whitespace-nowrap tabular-nums">
                        {g.daysLeft > 0 ? (
                          <><span className="text-emerald-500 font-bold">{g.daysLeft}</span> {t("dash.daysLeft", locale)}</>
                        ) : (
                          <span className="text-red-400 font-bold">Overdue</span>
                        )}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : mounted ? (
                <Link href="/timer" className="block bg-card border border-card rounded-xl px-4 py-6 text-center hover:border-emerald-500/30 transition-all">
                  <p className="text-xs text-muted">{t("dash.noGoals", locale)}</p>
                </Link>
              ) : (
                <div className="bg-card border border-card rounded-xl px-4 py-6 text-center">
                  <p className="text-xs text-muted">{t("dash.noData", locale)}</p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
