"use client";

import { t } from "@/lib/i18n";
import { TimerMode, TimerState, DailyGoal, EnsoTask } from "@/types";
import { PlayIcon, PauseIcon, SkipIcon, ExpandIcon, SpeakerOnIcon, SpeakerOffIcon } from "@/components/shared/Icons";

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

export default function FocusTab({ timer, focusMinutes, onFocusMinutesChange, onEnterFullscreen, ambientEnabled, onAmbientToggle, dailyGoal, todaySeconds, ensoTasks, selectedTaskId, onSelectTask }: Props) {
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
        <div className="mt-5 flex items-center gap-2">
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
