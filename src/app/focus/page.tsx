"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import type { DailyGoal, EnsoTask } from "@/types";
import { t } from "@/lib/i18n";
import {
  getDailyGoal,
  getEnsoTasksForFocus,
  getFocusStats,
} from "@/lib/storage";
import { useAppShell } from "@/components/shared/AppShell";
import { useTimerContext } from "@/components/shared/TimerProvider";
import PageHeader from "@/components/shared/PageHeader";
import FocusTab from "@/components/focus/tabs/FocusTab";
import HistoryTab from "@/components/focus/tabs/HistoryTab";
import FullscreenFocus from "@/components/focus/FullscreenFocus";

type TabId = "focus" | "history";

export default function FocusPage() {
  return (
    <Suspense fallback={null}>
      <FocusInner />
    </Suspense>
  );
}

function FocusInner() {
  const { locale, mounted } = useAppShell();
  const ctx = useTimerContext();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabId>("focus");
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>({ minutes: 0 });
  const [todaySeconds, setTodaySeconds] = useState(0);
  const [ensoTasks, setEnsoTasks] = useState<EnsoTask[]>([]);
  const [sessionVersion, setSessionVersion] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initial load + listeners
  useEffect(() => {
    setDailyGoal(getDailyGoal());
    setTodaySeconds(getFocusStats().today);
    const tasks = getEnsoTasksForFocus();
    setEnsoTasks(tasks);

    // Auto-select task from ?taskId=xxx
    const taskIdParam = searchParams.get("taskId");
    if (taskIdParam) {
      const task = tasks.find((tk) => tk.id === taskIdParam);
      if (task) {
        ctx.setSelectedTask(task.id, task.title);
        setActiveTab("focus");
      }
    }

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setEnsoTasks(getEnsoTasksForFocus());
        setTodaySeconds(getFocusStats().today);
      }
    };
    const handleRemoteChange = () => {
      setEnsoTasks(getEnsoTasksForFocus());
      setTodaySeconds(getFocusStats().today);
      setDailyGoal(getDailyGoal());
    };
    const handleSessionRecorded = () => {
      setTodaySeconds(getFocusStats().today);
      setSessionVersion((v) => v + 1);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("enso:remote-change", handleRemoteChange);
    window.addEventListener("enso:focus-session-recorded", handleSessionRecorded);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("enso:remote-change", handleRemoteChange);
      window.removeEventListener("enso:focus-session-recorded", handleSessionRecorded);
    };
    // ctx is stable from provider (memoized callbacks); intentionally exclude to avoid re-binding
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleEnterFullscreen = useCallback(() => {
    setIsFullscreen(true);
    document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  const handleExitFullscreen = useCallback(() => {
    setIsFullscreen(false);
    document.exitFullscreen?.().catch(() => {});
  }, []);

  useEffect(() => {
    const handler = () => { if (!document.fullscreenElement) setIsFullscreen(false); };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const handleSelectTask = useCallback((id: string | null) => {
    if (id === null) {
      ctx.setSelectedTask(null, null);
      return;
    }
    const task = ensoTasks.find((tk) => tk.id === id);
    ctx.setSelectedTask(id, task?.title ?? null);
  }, [ctx, ensoTasks]);

  if (!mounted) return null;

  if (isFullscreen) {
    return (
      <FullscreenFocus
        secondsLeft={ctx.secondsLeft}
        totalSeconds={ctx.totalSeconds}
        mode={ctx.mode}
        state={ctx.state}
        onPause={ctx.pause}
        onResume={ctx.resume}
        onReset={ctx.reset}
        onSkip={ctx.skip}
        onExit={handleExitFullscreen}
      />
    );
  }

  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <PageHeader title={t("focus.name", locale)} subtitle={t("focus.tagline", locale)} />

      {/* Local tab switcher (Focus / History) */}
      <div className="flex gap-2 mb-5 bg-card border border-card rounded-xl p-1">
        {(["focus", "history"] as const).map((tab) => (
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

      {activeTab === "focus" && (
        <FocusTab
          key={locale}
          timer={{
            secondsLeft: ctx.secondsLeft,
            totalSeconds: ctx.totalSeconds,
            mode: ctx.mode,
            state: ctx.state,
            start: ctx.start,
            pause: ctx.pause,
            resume: ctx.resume,
            reset: ctx.reset,
            skip: ctx.skip,
          }}
          focusMinutes={ctx.timerConfig.focusMinutes}
          onFocusMinutesChange={(m) => ctx.updateTimerConfig({ ...ctx.timerConfig, focusMinutes: m })}
          onEnterFullscreen={handleEnterFullscreen}
          ambientEnabled={ctx.ambientSettings.enabled}
          onAmbientToggle={() => ctx.updateAmbientSettings({ ...ctx.ambientSettings, enabled: !ctx.ambientSettings.enabled })}
          ambientType={ctx.ambientSettings.type}
          onAmbientTypeChange={(type) => ctx.updateAmbientSettings({ ...ctx.ambientSettings, type })}
          dailyGoal={dailyGoal}
          todaySeconds={todaySeconds}
          ensoTasks={ensoTasks}
          selectedTaskId={ctx.selectedTaskId}
          onSelectTask={handleSelectTask}
        />
      )}
      {activeTab === "history" && <HistoryTab key={`${locale}-${sessionVersion}`} />}
    </main>
  );
}
