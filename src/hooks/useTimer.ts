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

  // Tick
  useEffect(() => {
    if (state !== "running") {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [state, clearTimer]);

  // Handle completion
  useEffect(() => {
    if (secondsLeft === 0 && state === "running") {
      const completedMode = mode;
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
      setState("running");
      startTimeRef.current = new Date().toISOString();
    }
  }, [mode, state]);

  const start = useCallback(() => {
    startTimeRef.current = new Date().toISOString();
    setState("running");
  }, []);

  const pause = useCallback(() => {
    setState("paused");
  }, []);

  const resume = useCallback(() => {
    setState("running");
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setState("idle");
    setMode("focus");
    setSecondsLeft(config.focusMinutes * 60);
    startTimeRef.current = null;
  }, [clearTimer, config.focusMinutes]);

  const skip = useCallback(() => {
    clearTimer();
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
