"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type {
  AmbientSettings, CompletionSoundType, CustomTag, DailyGoal, EnsoTask, TimerConfig, TimerMode,
} from "@/types";
import { DEFAULT_TAGS, DEFAULT_TIMER_CONFIG } from "@/types";
import { t } from "@/lib/i18n";
import {
  getTimerConfig, saveTimerConfig,
  getAmbientSettings, saveAmbientSettings,
  getCompletionSound,
  getDailyGoal,
  getFocusTags,
  addFocusSession, getFocusStats,
  getEnsoTasksForFocus, recordFocusToJournal,
} from "@/lib/storage";
import { playCompletionSound, playAlert } from "@/lib/sound";
import { useAppShell } from "@/components/shared/AppShell";
import PageHeader from "@/components/shared/PageHeader";
import FocusTab from "@/components/focus/tabs/FocusTab";
import HistoryTab from "@/components/focus/tabs/HistoryTab";
import FullscreenFocus from "@/components/focus/FullscreenFocus";
import CompletionModal from "@/components/focus/CompletionModal";
import { useTimer } from "@/hooks/useTimer";
import { useAmbientSound } from "@/hooks/useAmbientSound";

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
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabId>("focus");
  const [timerConfig, setTimerConfig] = useState<TimerConfig>(DEFAULT_TIMER_CONFIG);
  const [ambientSettings, setAmbientSettings] = useState<AmbientSettings>({ enabled: false, type: "thunder", volume: 0.3 });
  const [completionSound, setCompletionSound] = useState<CompletionSoundType>("celebration");
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>({ minutes: 0 });
  const [tags, setTags] = useState<CustomTag[]>(DEFAULT_TAGS);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionVersion, setSessionVersion] = useState(0);
  const [todaySeconds, setTodaySeconds] = useState(0);

  const [ensoTasks, setEnsoTasks] = useState<EnsoTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [pendingSessionData, setPendingSessionData] = useState<{
    startedAt: string; endedAt: string; duration: number;
  } | null>(null);

  const sessionStartRef = useRef<string | null>(null);

  const handleTimerComplete = useCallback((mode: TimerMode) => {
    if (mode === "focus" && sessionStartRef.current) {
      const now = new Date().toISOString();
      const duration = Math.round((Date.now() - new Date(sessionStartRef.current).getTime()) / 1000);
      setPendingSessionData({ startedAt: sessionStartRef.current, endedAt: now, duration });
      sessionStartRef.current = null;
      setShowCompletionModal(true);
      playCompletionSound(completionSound);
    } else if (mode === "break") {
      playAlert();
    }
  }, [completionSound]);

  const timer = useTimer({ config: timerConfig, onComplete: handleTimerComplete });

  useAmbientSound({
    enabled: ambientSettings.enabled, type: ambientSettings.type,
    volume: ambientSettings.volume, isPlaying: timer.state === "running", mode: timer.mode,
  });

  // Track session start
  useEffect(() => {
    if (timer.state === "running" && timer.mode === "focus" && !sessionStartRef.current) {
      sessionStartRef.current = new Date().toISOString();
    }
    if (timer.state === "idle" && timer.mode === "focus") {
      sessionStartRef.current = null;
    }
  }, [timer.state, timer.mode]);

  // Initial load
  useEffect(() => {
    setTimerConfig(getTimerConfig());
    setAmbientSettings(getAmbientSettings());
    setCompletionSound(getCompletionSound());
    setDailyGoal(getDailyGoal());
    setTags(getFocusTags());
    setTodaySeconds(getFocusStats().today);

    const loadedTasks = getEnsoTasksForFocus();
    setEnsoTasks(loadedTasks);

    // Auto-select task from ?taskId=xxx
    const taskIdParam = searchParams.get("taskId");
    if (taskIdParam && loadedTasks.some((t) => t.id === taskIdParam)) {
      setSelectedTaskId(taskIdParam);
      setActiveTab("focus");
    }

    const handleVisibility = () => {
      if (document.visibilityState === "visible") setEnsoTasks(getEnsoTasksForFocus());
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [searchParams]);

  // Refresh today's seconds when sessionVersion changes
  useEffect(() => {
    setTodaySeconds(getFocusStats().today);
  }, [sessionVersion]);

  const selectedTask = ensoTasks.find((task) => task.id === selectedTaskId);

  const handleMemoSave = useCallback((data: { memo: string; tag?: string }) => {
    if (pendingSessionData) {
      addFocusSession({
        ...pendingSessionData,
        memo: data.memo || undefined,
        tag: data.tag,
        taskId: selectedTaskId ?? undefined,
        taskTitle: selectedTask?.title,
      });
      setSessionVersion((v) => v + 1);
      const durationMin = Math.round(pendingSessionData.duration / 60);
      const tagName = data.tag ? tags.find((tg) => tg.id === data.tag)?.name || data.tag : null;
      const label = data.memo || selectedTask?.title || tagName || "Focus";
      recordFocusToJournal(label, durationMin);
    }
    setPendingSessionData(null);
    setShowCompletionModal(false);
    setSelectedTaskId(null);
    if (timerConfig.autoStartBreak) timer.startBreak();
  }, [pendingSessionData, selectedTaskId, selectedTask, tags, timerConfig.autoStartBreak, timer]);

  const handleMemoSkip = useCallback(() => {
    if (pendingSessionData) {
      addFocusSession({
        ...pendingSessionData,
        taskId: selectedTaskId ?? undefined,
        taskTitle: selectedTask?.title,
      });
      setSessionVersion((v) => v + 1);
      const durationMin = Math.round(pendingSessionData.duration / 60);
      const label = selectedTask?.title || "Focus";
      recordFocusToJournal(label, durationMin);
    }
    setPendingSessionData(null);
    setShowCompletionModal(false);
    setSelectedTaskId(null);
    if (timerConfig.autoStartBreak) timer.startBreak();
  }, [pendingSessionData, selectedTaskId, selectedTask, timerConfig.autoStartBreak, timer]);

  const handleAmbientToggle = useCallback(() => {
    const u = { ...ambientSettings, enabled: !ambientSettings.enabled };
    setAmbientSettings(u); saveAmbientSettings(u);
  }, [ambientSettings]);

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

  if (!mounted) return null;

  if (isFullscreen) {
    return (
      <FullscreenFocus
        secondsLeft={timer.secondsLeft}
        totalSeconds={timer.totalSeconds}
        mode={timer.mode}
        state={timer.state}
        onPause={timer.pause}
        onResume={timer.resume}
        onReset={timer.reset}
        onSkip={timer.skip}
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
          timer={timer}
          focusMinutes={timerConfig.focusMinutes}
          onFocusMinutesChange={(m) => {
            const next = { ...timerConfig, focusMinutes: m };
            setTimerConfig(next);
            saveTimerConfig(next);
          }}
          onEnterFullscreen={handleEnterFullscreen}
          ambientEnabled={ambientSettings.enabled}
          onAmbientToggle={handleAmbientToggle}
          dailyGoal={dailyGoal}
          todaySeconds={todaySeconds}
          ensoTasks={ensoTasks}
          selectedTaskId={selectedTaskId}
          onSelectTask={setSelectedTaskId}
        />
      )}
      {activeTab === "history" && <HistoryTab key={`${locale}-${sessionVersion}`} />}

      {showCompletionModal && pendingSessionData && (
        <CompletionModal
          duration={pendingSessionData.duration}
          tags={tags}
          defaultMemo={selectedTask?.title}
          onSave={handleMemoSave}
          onSkip={handleMemoSkip}
        />
      )}
    </main>
  );
}
