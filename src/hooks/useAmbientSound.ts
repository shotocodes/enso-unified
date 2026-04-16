"use client";

import { useEffect } from "react";
import { AmbientSoundType, TimerMode } from "@/types";
import { startAmbient, stopAmbient, setAmbientVolume } from "@/lib/ambient";

interface Options {
  enabled: boolean;
  type: AmbientSoundType;
  volume: number;
  isPlaying: boolean;
  mode: TimerMode;
}

export function useAmbientSound({ enabled, type, volume, isPlaying, mode }: Options): void {
  useEffect(() => {
    if (enabled && isPlaying) {
      // startAmbient is now async but we fire-and-forget
      startAmbient(mode === "focus" ? type : "break", volume);
    } else {
      stopAmbient();
    }
    return () => stopAmbient();
  }, [enabled, isPlaying, type, mode, volume]);

  useEffect(() => {
    if (enabled && isPlaying) {
      setAmbientVolume(volume);
    }
  }, [volume, enabled, isPlaying]);
}
