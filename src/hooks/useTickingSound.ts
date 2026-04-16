"use client";

import { useEffect } from "react";
import { SoundSettings } from "@/types";
import { playTickSound, setVolume } from "@/lib/sound";

export function useTickingSound(settings: SoundSettings): void {
  useEffect(() => {
    setVolume(settings.volume);
  }, [settings.volume]);

  useEffect(() => {
    if (!settings.enabled) return;
    const id = setInterval(() => playTickSound(settings.tickSound), 1000);
    return () => clearInterval(id);
  }, [settings.enabled, settings.tickSound]);
}
