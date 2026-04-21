"use client";

import { t } from "@/lib/i18n";
import { TimerMode, TimerState, DailyGoal, EnsoTask, AmbientSoundType } from "@/types";
import { PlayIcon, PauseIcon, SkipIcon, ExpandIcon, SpeakerOnIcon, SpeakerOffIcon } from "@/components/shared/Icons";

const AMBIENT_TYPES: AmbientSoundType[] = ["thunder", "fire", "cafe", "birds", "waves"];

function AmbientIcon({ type, size = 18 }: { type: AmbientSoundType; size?: number }) {
  switch (type) {
    case "thunder":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9" />
          <polyline points="13 11 9 17 15 17 11 23" fill="#f59e0b" stroke="#f59e0b" />
        </svg>
      );
    case "fire":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="#f97316" />
        </svg>
      );
    case "cafe":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#a16207" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
          <line x1="6" x2="6" y1="2" y2="4" />
          <line x1="10" x2="10" y1="2" y2="4" />
          <line x1="14" x2="14" y1="2" y2="4" />
        </svg>
      );
    case "birds":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 7h.01" />
          <path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20" />
          <path d="m20 7 2 .5-2 .5" />
          <path d="M10 18v3" />
          <path d="M14 17.75V21" />
          <path d="M7 18a6 6 0 0 0 3.84-10.61" />
        </svg>
      );
    case "waves":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
          <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
          <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        </svg>
      );
  }
}

interface TimerHandle {
  secondsLeft: number;
  totalSeconds: number;
  mode: TimerMode;
  state: TimerState;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
}

const FOCUS_QUICK_OPTIONS = [15, 25, 30, 45, 60];

interface Props {
  timer: TimerHandle;
  focusMinutes: number;
  onFocusMinutesChange: (m: number) => void;
  onEnterFullscreen: () => void;
  ambientEnabled: boolean;
  onAmbientToggle: () => void;
  ambientType: AmbientSoundType;
  onAmbientTypeChange: (type: AmbientSoundType) => void;
  dailyGoal: DailyGoal;
  todaySeconds: number;
  ensoTasks: EnsoTask[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function ResetIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4v6h6" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

const PRIORITY_COLORS: Record<string, string> = { high: "text-red-400", medium: "text-amber-400", low: "text-emerald-400" };

export default function FocusTab({ timer, focusMinutes, onFocusMinutesChange, onEnterFullscreen, ambientEnabled, onAmbientToggle, ambientType, onAmbientTypeChange, dailyGoal, todaySeconds, ensoTasks, selectedTaskId, onSelectTask }: Props) {
  const { secondsLeft, totalSeconds, mode, state, start, pause, resume, reset, skip } = timer;
  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const isFocus = mode === "focus";
  const accentClass = isFocus ? "bg-emerald-500 hover:bg-emerald-600" : "bg-amber-500 hover:bg-amber-600";

  const size = 280;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const goalTarget = dailyGoal.minutes * 60;
  const goalProgress = goalTarget > 0 ? Math.min(todaySeconds / goalTarget, 1) : 0;
  const goalAchieved = goalTarget > 0 && todaySeconds >= goalTarget;

  return (
    <div className="animate-tab-enter flex flex-col items-center">
      {/* ENSO TASK連携: タスク選択 */}
      {ensoTasks.length > 0 && state === "idle" && (
        <div className="w-full max-w-xs mb-5">
          <p className="text-xs text-muted mb-2">{t("focus.selectTask")}</p>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {ensoTasks.slice(0, 5).map((task) => (
              <button
                key={task.id}
                onClick={() => onSelectTask(selectedTaskId === task.id ? null : task.id)}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                  selectedTaskId === task.id
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-500"
                    : "bg-card border border-card hover:border-emerald-500/20"
                }`}
              >
                <span className={`text-[10px] font-bold ${PRIORITY_COLORS[task.priority] ?? "text-muted"}`}>
                  {task.priority === "high" ? "!" : task.priority === "medium" ? "-" : ""}
                </span>
                <span className="truncate">{task.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 選択中のタスク表示（タイマー実行中） */}
      {selectedTaskId && state !== "idle" && (
        <div className="mb-3 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium max-w-xs truncate">
          {ensoTasks.find((t) => t.id === selectedTaskId)?.title}
        </div>
      )}

      {/* Mode label */}
      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4 ${
        isFocus ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
      }`}>
        <span className={`w-2 h-2 rounded-full ${isFocus ? "bg-emerald-500" : "bg-amber-500"} ${
          state === "running" ? "animate-timer-pulse" : ""
        }`} />
        {t(isFocus ? "focus.mode.focus" : "focus.mode.break")}
      </div>

      {/* Timer ring */}
      <div className="relative mb-6">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-subtle opacity-30" />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={dashOffset}
            className={`transition-all duration-1000 ease-linear ${isFocus ? "text-emerald-500" : "text-amber-500"}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-mono font-light tracking-wider">{formatTime(secondsLeft)}</span>
          {state === "idle" && <span className="text-xs text-muted mt-2">{t("focus.ready")}</span>}
        </div>
      </div>

      {/* Quick duration selector (idle + focus mode only) */}
      {state === "idle" && isFocus && (
        <div className="flex items-center gap-2 mb-6">
          {FOCUS_QUICK_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => onFocusMinutesChange(m)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                focusMinutes === m
                  ? "bg-emerald-500 text-white"
                  : "bg-card border border-card text-muted hover:text-emerald-500"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-5">
        {state === "idle" ? (
          <button onClick={start}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors text-white ${accentClass}`}>
            <PlayIcon size={28} />
          </button>
        ) : (
          <>
            <button onClick={reset}
              className="w-12 h-12 rounded-full bg-card border border-card flex items-center justify-center text-muted hover:text-red-400 transition-colors">
              <ResetIcon size={18} />
            </button>
            <button onClick={state === "running" ? pause : resume}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors text-white ${accentClass}`}>
              {state === "running" ? <PauseIcon size={28} /> : <PlayIcon size={28} />}
            </button>
            <button onClick={skip}
              className="w-12 h-12 rounded-full bg-card border border-card flex items-center justify-center text-muted hover:text-white transition-colors">
              <SkipIcon size={18} />
            </button>
          </>
        )}
      </div>

      {/* Sub controls (ambient + fullscreen) */}
      {state !== "idle" && (
        <div className="mt-5 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <button onClick={onAmbientToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-card text-xs transition-colors ${
                ambientEnabled ? "text-emerald-500 border-emerald-500/20" : "text-muted hover:text-white"
              }`}>
              {ambientEnabled ? <SpeakerOnIcon size={14} /> : <SpeakerOffIcon size={14} />}
              {t("settings.ambient")}
            </button>
            <button onClick={onEnterFullscreen}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-card text-xs text-muted hover:text-white transition-colors">
              <ExpandIcon size={14} />
              {t("focus.fullscreen")}
            </button>
          </div>
          {ambientEnabled && (
            <div className="flex items-center gap-2">
              {AMBIENT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => onAmbientTypeChange(type)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    ambientType === type
                      ? "bg-card border border-emerald-500/40 scale-110"
                      : "bg-card border border-card opacity-40 hover:opacity-80"
                  }`}
                  title={type}
                >
                  <AmbientIcon type={type} size={17} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Daily goal progress */}
      {goalTarget > 0 && (
        <div className="mt-6 w-full max-w-xs">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted">{t("goal.progress")}</span>
            <span className={goalAchieved ? "text-emerald-500 font-medium" : "text-muted"}>
              {goalAchieved ? t("goal.achieved") : `${Math.round(todaySeconds / 60)}/${dailyGoal.minutes}${t("settings.minutesSuffix")}`}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-subtle overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${goalAchieved ? "bg-emerald-500" : "bg-emerald-500/60"}`}
              style={{ width: `${goalProgress * 100}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
