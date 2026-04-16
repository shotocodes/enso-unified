// ================================================
// ENSO Unified - 統合型定義
// ================================================

export type ThemeMode = "dark" | "light" | "system";
export type Locale = "ja" | "en" | "zh" | "ko";

// ================================================
// TIMER
// ================================================

export interface LifeConfig {
  birthDate: string;
  lifeExpectancy: number;
}

export type NotifyTiming = "2w" | "1w" | "3d" | "1d" | "1h" | "0";

export const NOTIFY_TIMING_I18N_KEYS: Record<NotifyTiming, string> = {
  "2w": "notify.2w",
  "1w": "notify.1w",
  "3d": "notify.3d",
  "1d": "notify.1d",
  "1h": "notify.1h",
  "0": "notify.deadline",
};

export const NOTIFY_TIMING_MS: Record<NotifyTiming, number> = {
  "2w": 14 * 86400000,
  "1w": 7 * 86400000,
  "3d": 3 * 86400000,
  "1d": 1 * 86400000,
  "1h": 3600000,
  "0": 0,
};

export interface Goal {
  id: string;
  title: string;
  deadline: string;
  createdAt: string;
  achievedAt?: string;
  memo?: string;
  notifyTimings?: NotifyTiming[];
}

export type TickSoundType = "classic" | "soft" | "digital";

export const TICK_SOUND_I18N_KEYS: Record<TickSoundType, string> = {
  classic: "sound.classic",
  soft: "sound.soft",
  digital: "sound.digital",
};

export interface SoundSettings {
  enabled: boolean;
  tickSound: TickSoundType;
  volume: number;
}

export type TimeUnit = "days" | "hours" | "minutes" | "seconds";

export interface TimeRemaining {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

// ================================================
// FOCUS
// ================================================

export type TimerMode = "focus" | "break";
export type TimerState = "idle" | "running" | "paused";

export interface TimerConfig {
  focusMinutes: number;
  breakMinutes: number;
  autoStartBreak: boolean;
}

export const DEFAULT_TIMER_CONFIG: TimerConfig = {
  focusMinutes: 25,
  breakMinutes: 5,
  autoStartBreak: true,
};

export interface CustomTag {
  id: string;
  name: string;
  color: string;
}

export const PALETTE = [
  "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444",
  "#10b981", "#ec4899", "#06b6d4", "#f97316",
];

export const DEFAULT_TAGS: CustomTag[] = [
  { id: "work", name: "仕事", color: "#3b82f6" },
  { id: "study", name: "勉強", color: "#8b5cf6" },
  { id: "creative", name: "創作", color: "#f59e0b" },
  { id: "exercise", name: "運動", color: "#ef4444" },
];

export interface FocusSession {
  id: string;
  startedAt: string;
  endedAt: string;
  duration: number;
  tag?: string;
  memo?: string;
  taskId?: string;
  taskTitle?: string;
}

export interface EnsoTask {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
}

export type CompletionSoundType = "celebration" | "chime" | "gentle" | "none";

export const COMPLETION_SOUND_I18N_KEYS: Record<CompletionSoundType, string> = {
  celebration: "sound.celebration",
  chime: "sound.chime",
  gentle: "sound.gentle",
  none: "sound.none",
};

export type AmbientSoundType = "thunder" | "fire" | "cafe" | "birds" | "waves";

export const AMBIENT_SOUND_I18N_KEYS: Record<AmbientSoundType, string> = {
  thunder: "ambient.thunder",
  fire: "ambient.fire",
  cafe: "ambient.cafe",
  birds: "ambient.birds",
  waves: "ambient.waves",
};

export interface AmbientSettings {
  enabled: boolean;
  type: AmbientSoundType;
  volume: number;
}

export interface DailyGoal {
  minutes: number;
}

// ================================================
// TASK
// ================================================

export type Priority = "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  goalId?: string;
  milestoneId?: string;
  completed: boolean;
  completedAt?: string;
  order: number;
  active?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  order: number;
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  high: "text-red-400",
  medium: "text-amber-400",
  low: "text-emerald-400",
};

export const PRIORITY_BG: Record<Priority, string> = {
  high: "bg-red-400/10 border-red-400/20",
  medium: "bg-amber-400/10 border-amber-400/20",
  low: "bg-emerald-400/10 border-emerald-400/20",
};

// ================================================
// JOURNAL
// ================================================

export interface DailyJournal {
  date: string;
  mood?: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  notes: string[];
  aiSummary?: string;
  manualEntries: ManualEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface ManualEntry {
  id: string;
  time: string;
  text: string;
  icon: EntryIcon;
}

export type EntryIcon = "focus" | "done" | "memo" | "idea";

export const ENTRY_ICONS: Record<EntryIcon, string> = {
  focus: "🎯",
  done: "✅",
  memo: "📝",
  idea: "💡",
};

export const MOODS = ["😔", "😐", "🙂", "😊", "😄"] as const;

// ================================================
// UI / Navigation
// ================================================

export type PageId = "dashboard" | "timer" | "task" | "focus" | "journal";

export interface AppSettings {
  locale: Locale;
  theme: ThemeMode;
}
