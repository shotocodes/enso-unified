"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TimerMode, TimerState, TimerConfig } from "@/types";

interface UseTimerOptions {
  config: TimerConfig;
  onComplete: (mode: TimerMode) => void;
}

interface UseTimerReturn {
  secondsLeft: number;
  totalSeconds: number;
  mode: TimerMode;
  state: TimerState;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
  startBreak: () => void;
}

export function useTimer({ config, onComplete }: UseTimerOptions): UseTimerReturn {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [state, setState] = useState<TimerState>("idle");
  const totalSeconds = mode === "focus" ? config.focusMinutes * 60 : config.breakMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<string | null>(null);
  // Wall-clock target end (Date.now() ms). Set when running; null when paused/idle.
  // Drives remaining-time calculation so background throttling can't desync the timer.
  const endsAtRef = useRef<number | null>(null);

  // Sync secondsLeft when config or mode changes while idle
  useEffect(() => {
    if (state === "idle") {
      setSecondsLeft(mode === "focus" ? config.focusMinutes * 60 : config.breakMinutes * 60);
    }
  }, [config.focusMinutes, config.breakMinutes, mode, state]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const recompute = useCallback(() => {
    if (endsAtRef.current === null) return;
    const remaining = Math.max(0, Math.ceil((endsAtRef.current - Date.now()) / 1000));
    setSecondsLeft(remaining);
    if (remaining === 0) clearTimer();
  }, [clearTimer]);

  // Tick — recompute from wall clock instead of decrementing, so background
  // throttling/suspension self-corrects on the next tick.
  useEffect(() => {
    if (state !== "running") {
      clearTimer();
      return;
    }
    recompute();
    intervalRef.current = setInterval(recompute, 250);
    return clearTimer;
  }, [state, clearTimer, recompute]);

  // Re-sync immediately when the page becomes visible — covers PWA backgrounded
  // on the home screen, where setInterval is paused entirely.
  useEffect(() => {
    if (state !== "running") return;
    const onVisibility = () => {
      if (document.visibilityState === "visible") recompute();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [state, recompute]);

  // Handle completion
  useEffect(() => {
    if (secondsLeft === 0 && state === "running") {
      const completedMode = mode;
      endsAtRef.current = null;
      setState("idle");
      onComplete(completedMode);

      const nextMode: TimerMode = completedMode === "focus" ? "break" : "focus";
      setMode(nextMode);
      setSecondsLeft(nextMode === "focus" ? config.focusMinutes * 60 : config.breakMinutes * 60);

      // Auto-start break only if coming from break→focus (no modal interruption)
      // For focus→break, page.tsx calls startBreak() after CompletionModal closes
      if (nextMode === "focus" && completedMode === "break") {
        // break完了 → focusは自動開始しない（ユーザーが開始ボタンを押す）
      }
    }
  }, [secondsLeft, state, mode, config, onComplete]);

  const startBreak = useCallback(() => {
    if (mode === "break" && state === "idle") {
      const total = config.breakMinutes * 60;
      endsAtRef.current = Date.now() + total * 1000;
      startTimeRef.current = new Date().toISOString();
      setSecondsLeft(total);
      setState("running");
    }
  }, [mode, state, config.breakMinutes]);

  const start = useCallback(() => {
    const total = mode === "focus" ? config.focusMinutes * 60 : config.breakMinutes * 60;
    endsAtRef.current = Date.now() + total * 1000;
    startTimeRef.current = new Date().toISOString();
    setSecondsLeft(total);
    setState("running");
  }, [mode, config.focusMinutes, config.breakMinutes]);

  const pause = useCallback(() => {
    if (endsAtRef.current !== null) {
      const remaining = Math.max(0, Math.ceil((endsAtRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);
      endsAtRef.current = null;
    }
    setState("paused");
  }, []);

  const resume = useCallback(() => {
    setSecondsLeft((prev) => {
      endsAtRef.current = Date.now() + prev * 1000;
      return prev;
    });
    setState("running");
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    endsAtRef.current = null;
    setState("idle");
    setMode("focus");
    setSecondsLeft(config.focusMinutes * 60);
    startTimeRef.current = null;
  }, [clearTimer, config.focusMinutes]);

  const skip = useCallback(() => {
    clearTimer();
    endsAtRef.current = null;
    // If skipping focus, still fire onComplete for recording
    if (mode === "focus" && state === "running") {
      onComplete(mode);
    }
    const nextMode: TimerMode = mode === "focus" ? "break" : "focus";
    setMode(nextMode);
    setSecondsLeft(nextMode === "focus" ? config.focusMinutes * 60 : config.breakMinutes * 60);
    setState("idle");
    startTimeRef.current = null;
  }, [clearTimer, mode, state, config, onComplete]);

  return {
    secondsLeft,
    totalSeconds,
    mode,
    state,
    start,
    pause,
    resume,
    reset,
    skip,
    startBreak,
  };
}

export function getStartTimeRef() {
  return new Date().toISOString();
}
