"use client";

import { useState, useEffect, useCallback } from "react";
import { t } from "@/lib/i18n";
import { getJournalEntries, saveJournalEntries } from "@/lib/storage";
import type { DailyJournal } from "@/types";
import { useAppShell } from "@/components/shared/AppShell";
import PageHeader from "@/components/shared/PageHeader";
import TodayTab from "@/components/journal/tabs/TodayTab";
import TimelineTab from "@/components/journal/tabs/TimelineTab";

type TabId = "today" | "timeline";

export default function JournalPage() {
  const { locale, mounted } = useAppShell();
  const [activeTab, setActiveTab] = useState<TabId>("today");
  const [entries, setEntries] = useState<DailyJournal[]>([]);

  // Initial load
  useEffect(() => {
    setEntries(getJournalEntries());
  }, []);

  // Reload on focus / visibility change (catches FOCUS/TASK writes)
  useEffect(() => {
    const reload = () => setEntries(getJournalEntries());
    const onVisibility = () => {
      if (document.visibilityState === "visible") reload();
    };
    window.addEventListener("focus", reload);
    window.addEventListener("enso:remote-change", reload);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", reload);
      window.removeEventListener("enso:remote-change", reload);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const handleEntriesChange = useCallback((next: DailyJournal[]) => {
    setEntries(next);
    saveJournalEntries(next);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <PageHeader title={t("journal.name", locale)} subtitle={t("journal.tagline", locale)} />

      <div className="flex gap-2 mb-5 bg-card border border-card rounded-xl p-1">
        {(["today", "timeline"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === tab
                ? "bg-emerald-500/15 text-emerald-500"
                : "text-muted hover:opacity-80"
            }`}
          >
            {t(`tabs.${tab}`, locale)}
          </button>
        ))}
      </div>

      <div key={`${activeTab}-${locale}`}>
        {activeTab === "today" && (
          <TodayTab locale={locale} entries={entries} onEntriesChange={handleEntriesChange} />
        )}
        {activeTab === "timeline" && (
          <TimelineTab locale={locale} entries={entries} />
        )}
      </div>
    </main>
  );
}
