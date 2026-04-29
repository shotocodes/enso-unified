"use client";

import {
  createContext, useContext, useState, useEffect, useCallback, useRef, useMemo,
} from "react";
import type {
  AmbientSettings, CompletionSoundType, CustomTag,
  TimerConfig, TimerMode, TimerState,
} from "@/types";
import { DEFAULT_TAGS, DEFAULT_TIMER_CONFIG } from "@/types";
import {
  getTimerConfig, saveTimerConfig,
  getAmbientSettings, saveAmbientSettings,
  getCompletionSound,
  getFocusTags,
  addFocusSession,
  recordFocusToJournal,
} from "@/lib/storage";
import { playCompletionSound, playAlert } from "@/lib/sound";
import { t } from "@/lib/i18n";
import { useTimer } from "@/hooks/useTimer";
import { useAmbientSound } from "@/hooks/useAmbientSound";
import CompletionModal from "@/components/focus/CompletionModal";

function showSystemNotification(title: string, body: string) {
  if (typeof window === "undefined") return;
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  if (document.visibilityState === "visible") return; // suppress when tab is already in focus
  try {
    new Notification(title, { body, icon: "/icon-192.png", tag: "enso-focus" });
  } catch {
    // some browsers throw on construction (e.g. iOS Safari without a service worker context)
  }
}

function ensureNotificationPermission() {
  if (typeof Notification === "undefined") return;
  if (Notification.permission === "default") {
    Notification.requestPermission().catch(() => {});
  }
}

interface PendingSession {
  startedAt: string;
  endedAt: string;
  duration: number;
}

interface TimerContextValue {
  // Timer state (re-exported from useTimer)
  secondsLeft: number;
  totalSeconds: number;
  mode: TimerMode;
  state: TimerState;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;

  // Persistent config (lifted so settings survive route changes)
  timerConfig: TimerConfig;
  updateTimerConfig: (c: TimerConfig) => void;
  ambientSettings: AmbientSettings;
  updateAmbientSettings: (s: AmbientSettings) => void;

  // Selected task linked to the current focus session
  selectedTaskId: string | null;
  selectedTaskTitle: string | null;
  setSelectedTask: (id: string | null, title?: string | null) => void;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function useTimerContext(): TimerContextValue {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimerContext must be used inside <TimerProvider>");
  return ctx;
}

export default function TimerProvider({ children }: { children: React.ReactNode }) {
  const [timerConfig, setTimerConfig] = useState<TimerConfig>(DEFAULT_TIMER_CONFIG);
  const [ambientSettings, setAmbientSettingsState] = useState<AmbientSettings>({
    enabled: false, type: "thunder", volume: 0.3,
  });
  const [completionSound, setCompletionSound] = useState<CompletionSoundType>("celebration");
  const [tags, setTags] = useState<CustomTag[]>(DEFAULT_TAGS);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<string | null>(null);

  const [pendingSession, setPendingSession] = useState<PendingSession | null>(null);

  const sessionStartRef = useRef<string | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setTimerConfig(getTimerConfig());
    setAmbientSettingsState(getAmbientSettings());
    setCompletionSound(getCompletionSound());
    setTags(getFocusTags());
  }, []);

  // Re-read settings when they may have changed elsewhere:
  //  - remote-change: another device updated them
  //  - visibilitychange: user returned to the tab (catches /settings edits in another window)
  useEffect(() => {
    const refresh = () => {
      setTimerConfig(getTimerConfig());
      setAmbientSettingsState(getAmbientSettings());
      setCompletionSound(getCompletionSound());
      setTags(getFocusTags());
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("enso:remote-change", refresh);
    window.addEventListener("enso:settings-changed", refresh);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("enso:remote-change", refresh);
      window.removeEventListener("enso:settings-changed", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const handleTimerComplete = useCallback((mode: TimerMode) => {
    if (mode === "focus" && sessionStartRef.current) {
      const now = new Date().toISOString();
      const duration = Math.round((Date.now() - new Date(sessionStartRef.current).getTime()) / 1000);
      setPendingSession({ startedAt: sessionStartRef.current, endedAt: now, duration });
      sessionStartRef.current = null;
      playCompletionSound(completionSound);
      showSystemNotification(t("focus.sessionComplete"), t("focus.notify.focusBody"));
    } else if (mode === "break") {
      playAlert();
      showSystemNotification(t("focus.breakComplete"), t("focus.notify.breakBody"));
    }
  }, [completionSound]);

  const timer = useTimer({ config: timerConfig, onComplete: handleTimerComplete });

  // Ambient sound follows the timer — keeps playing across route changes
  useAmbientSound({
    enabled: ambientSettings.enabled,
    type: ambientSettings.type,
    volume: ambientSettings.volume,
    isPlaying: timer.state === "running",
    mode: timer.mode,
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

  const updateTimerConfig = useCallback((c: TimerConfig) => {
    setTimerConfig(c);
    saveTimerConfig(c);
  }, []);

  const updateAmbientSettings = useCallback((s: AmbientSettings) => {
    setAmbientSettingsState(s);
    saveAmbientSettings(s);
  }, []);

  const setSelectedTask = useCallback((id: string | null, title?: string | null) => {
    setSelectedTaskId(id);
    setSelectedTaskTitle(title ?? null);
  }, []);

  const closeModal = useCallback(() => {
    setPendingSession(null);
    setSelectedTaskId(null);
    setSelectedTaskTitle(null);
    if (timerConfig.autoStartBreak) timer.startBreak();
  }, [timerConfig.autoStartBreak, timer]);

  const saveSession = useCallback((data: { memo: string; tag?: string }) => {
    if (pendingSession) {
      addFocusSession({
        ...pendingSession,
        memo: data.memo || undefined,
        tag: data.tag,
        taskId: selectedTaskId ?? undefined,
        taskTitle: selectedTaskTitle ?? undefined,
      });
      const durationMin = Math.round(pendingSession.duration / 60);
      const tagName = data.tag ? tags.find((tg) => tg.id === data.tag)?.name || data.tag : null;
      const label = data.memo || selectedTaskTitle || tagName || "Focus";
      recordFocusToJournal(label, durationMin);
      window.dispatchEvent(new CustomEvent("enso:focus-session-recorded"));
    }
    closeModal();
  }, [pendingSession, selectedTaskId, selectedTaskTitle, tags, closeModal]);

  const skipSession = useCallback(() => {
    if (pendingSession) {
      addFocusSession({
        ...pendingSession,
        taskId: selectedTaskId ?? undefined,
        taskTitle: selectedTaskTitle ?? undefined,
      });
      const durationMin = Math.round(pendingSession.duration / 60);
      const label = selectedTaskTitle || "Focus";
      recordFocusToJournal(label, durationMin);
      window.dispatchEvent(new CustomEvent("enso:focus-session-recorded"));
    }
    closeModal();
  }, [pendingSession, selectedTaskId, selectedTaskTitle, closeModal]);

  // Wrap start so the first user gesture also requests notification permission.
  // requestPermission is a no-op once already granted/denied — safe to call repeatedly.
  const startWithPermission = useCallback(() => {
    ensureNotificationPermission();
    timer.start();
  }, [timer]);

  const value = useMemo<TimerContextValue>(
    () => ({
      secondsLeft: timer.secondsLeft,
      totalSeconds: timer.totalSeconds,
      mode: timer.mode,
      state: timer.state,
      start: startWithPermission,
      pause: timer.pause,
      resume: timer.resume,
      reset: timer.reset,
      skip: timer.skip,
      timerConfig,
      updateTimerConfig,
      ambientSettings,
      updateAmbientSettings,
      selectedTaskId,
      selectedTaskTitle,
      setSelectedTask,
    }),
    [
      timer.secondsLeft, timer.totalSeconds, timer.mode, timer.state,
      startWithPermission, timer.pause, timer.resume, timer.reset, timer.skip,
      timerConfig, updateTimerConfig,
      ambientSettings, updateAmbientSettings,
      selectedTaskId, selectedTaskTitle, setSelectedTask,
    ]
  );

  return (
    <TimerContext.Provider value={value}>
      {children}
      {pendingSession && (
        <CompletionModal
          duration={pendingSession.duration}
          tags={tags}
          defaultMemo={selectedTaskTitle ?? undefined}
          onSave={saveSession}
          onSkip={skipSession}
        />
      )}
    </TimerContext.Provider>
  );
}
