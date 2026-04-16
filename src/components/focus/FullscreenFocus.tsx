"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import { TimerMode, TimerState } from "@/types";
import { PlayIcon, PauseIcon, SkipIcon, ShrinkIcon } from "@/components/shared/Icons";

interface Props {
  secondsLeft: number;
  totalSeconds: number;
  mode: TimerMode;
  state: TimerState;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSkip: () => void;
  onExit: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function FullscreenFocus({ secondsLeft, totalSeconds, mode, state, onPause, onResume, onReset, onSkip, onExit }: Props) {
  const [showControls, setShowControls] = useState(true);
  const isFocus = mode === "focus";
  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;

  const size = 360;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center cursor-pointer select-none"
      onClick={() => setShowControls((v) => !v)}>

      <div className={`mb-4 text-sm font-medium transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"} ${isFocus ? "text-emerald-500" : "text-amber-500"}`}>
        {t(isFocus ? "focus.mode.focus" : "focus.mode.break")}
      </div>

      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={dashOffset}
            className={`transition-all duration-1000 ease-linear ${isFocus ? "text-emerald-500" : "text-amber-500"}`} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-8xl font-mono font-extralight tracking-wider text-white">{formatTime(secondsLeft)}</span>
        </div>
      </div>

      <div className={`mt-8 flex items-center gap-6 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={(e) => e.stopPropagation()}>
        <button onClick={onReset} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors">
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 119 9 9.75 9.75 0 01-6.74-2.74L3 21" /><path d="M3 10V3h7" />
          </svg>
        </button>
        <button onClick={state === "running" ? onPause : onResume}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors text-white ${isFocus ? "bg-emerald-500 hover:bg-emerald-600" : "bg-amber-500 hover:bg-amber-600"}`}>
          {state === "running" ? <PauseIcon size={28} /> : <PlayIcon size={28} />}
        </button>
        <button onClick={onSkip} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors">
          <SkipIcon size={20} />
        </button>
      </div>

      <button className={`absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-white/40 hover:text-white/80 text-sm transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={(e) => { e.stopPropagation(); onExit(); }}>
        <ShrinkIcon size={16} />{t("focus.exitFullscreen")}
      </button>
    </div>
  );
}
