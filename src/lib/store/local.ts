// ================================================
// ENSO Unified - 統合ストレージ
// ================================================
//
// セキュリティ原則:
//  - データは全てクライアント側 localStorage のみに保存
//  - サーバー送信は AI 生成エンドポイント経由（入力テキストのみ）
//  - 個人情報 / APIキー / シークレットは保存しない
//
// localStorageキー体系（既存ユーザーのデータ互換を保つため変更しない）:
//  TIMER  : enso-life-config, enso-goals, enso-notified-goals, enso-sound-settings
//  FOCUS  : enso-focus-sessions, enso-focus-timer-config, enso-focus-tags,
//           enso-focus-completion-sound, enso-focus-ambient, enso-focus-daily-goal
//  TASK   : enso-task-tasks, enso-task-milestones
//  JOURNAL: enso-journal-entries, enso-journal-onboarded
//  UNIFIED: enso-theme, enso-locale, enso-last-backup-reminder

import type {
  AmbientSettings, CompletionSoundType, CustomTag, DailyGoal, DailyJournal,
  EnsoTask, FocusSession, Goal, LifeConfig, Locale, ManualEntry, Milestone,
  NotifyTiming, SoundSettings, Task, ThemeMode, TimerConfig,
} from "@/types";
import { DEFAULT_TAGS, DEFAULT_TIMER_CONFIG } from "@/types";

// ================================================
// Storage keys (central registry — keeps app compatibility)
// ================================================

export const KEYS = {
  // TIMER
  lifeConfig: "enso-life-config",
  goals: "enso-goals",
  notifiedGoals: "enso-notified-goals",
  soundSettings: "enso-sound-settings",

  // FOCUS
  focusSessions: "enso-focus-sessions",
  focusTimerConfig: "enso-focus-timer-config",
  focusTags: "enso-focus-tags",
  focusCompletionSound: "enso-focus-completion-sound",
  focusAmbient: "enso-focus-ambient",
  focusDailyGoal: "enso-focus-daily-goal",

  // TASK
  taskTasks: "enso-task-tasks",
  taskMilestones: "enso-task-milestones",

  // JOURNAL
  journalEntries: "enso-journal-entries",
  journalOnboarded: "enso-journal-onboarded",

  // UNIFIED
  theme: "enso-theme",
  locale: "enso-locale",
  backupReminder: "enso-last-backup-reminder",
} as const;

// Legacy keys for one-shot migration
const LEGACY_KEYS = {
  "lifft-life-config": KEYS.lifeConfig,
  "lifft-goals": KEYS.goals,
  "lifft-notified-goals": KEYS.notifiedGoals,
  "enso-timer-life-config": KEYS.lifeConfig,
  "enso-gw-theme": KEYS.theme,
  "enso-gw-locale": KEYS.locale,
} as const;

// ================================================
// Primitive helpers (SSR-safe)
// ================================================

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function safeGet<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`[storage] Failed to set ${key}:`, e);
  }
}

function safeRemove(key: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getTodayString(): string {
  return toLocalDateStr(new Date());
}

function getTodayStart(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

// ================================================
// Legacy migration (lifft-* → enso-*)
// ================================================

export function migrateLegacyStorage(): void {
  if (!isBrowser()) return;
  for (const [legacy, current] of Object.entries(LEGACY_KEYS)) {
    const old = localStorage.getItem(legacy);
    if (old !== null && !localStorage.getItem(current)) {
      localStorage.setItem(current, old);
      localStorage.removeItem(legacy);
    }
  }
}

// ================================================
// Global settings (theme / locale)
// ================================================

export function getTheme(): ThemeMode {
  return (safeGet<ThemeMode>(KEYS.theme)) ?? "dark";
}

export function saveTheme(theme: ThemeMode): void {
  safeSet(KEYS.theme, theme);
}

export function getLocale(): Locale {
  return (safeGet<Locale>(KEYS.locale)) ?? "ja";
}

export function saveLocale(locale: Locale): void {
  safeSet(KEYS.locale, locale);
}

// ================================================
// TIMER — Life config
// ================================================

export function getLifeConfig(): LifeConfig | null {
  return safeGet<LifeConfig>(KEYS.lifeConfig);
}

export function saveLifeConfig(config: LifeConfig): void {
  safeSet(KEYS.lifeConfig, config);
}

// ================================================
// TIMER — Goals
// ================================================

export function getGoals(): Goal[] {
  return safeGet<Goal[]>(KEYS.goals) ?? [];
}

export function saveGoals(goals: Goal[]): void {
  safeSet(KEYS.goals, goals);
}

export function addGoal(goal: Omit<Goal, "id" | "createdAt">): Goal {
  const newGoal: Goal = {
    ...goal,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  saveGoals([...getGoals(), newGoal]);
  return newGoal;
}

export function updateGoal(
  id: string,
  updates: Partial<Pick<Goal, "title" | "deadline" | "notifyTimings">>
): void {
  saveGoals(getGoals().map((g) => (g.id === id ? { ...g, ...updates } : g)));
}

export function deleteGoal(id: string): void {
  saveGoals(getGoals().filter((g) => g.id !== id));
}

export function achieveGoal(id: string, memo?: string): Goal | null {
  const goals = getGoals();
  const idx = goals.findIndex((g) => g.id === id);
  if (idx === -1) return null;
  goals[idx] = {
    ...goals[idx],
    achievedAt: new Date().toISOString(),
    ...(memo ? { memo } : {}),
  };
  saveGoals(goals);
  return goals[idx];
}

export function unachieveGoal(id: string): void {
  const goals = getGoals();
  const idx = goals.findIndex((g) => g.id === id);
  if (idx !== -1) {
    const { achievedAt: _achievedAt, ...rest } = goals[idx];
    void _achievedAt;
    goals[idx] = rest as Goal;
    saveGoals(goals);
  }
}

export function getActiveGoalsList(): Goal[] {
  return getGoals().filter((g) => !g.achievedAt);
}

export function getAchievedGoals(): Goal[] {
  return getGoals()
    .filter((g) => g.achievedAt)
    .sort((a, b) => (b.achievedAt! > a.achievedAt! ? 1 : -1));
}

export function getDefaultNotifyTimings(deadlineISO: string): NotifyTiming[] {
  const days = (new Date(deadlineISO).getTime() - Date.now()) / 86400000;
  if (days <= 7) return ["3d", "1d", "1h", "0"];
  return ["2w", "1w", "3d", "1d", "1h", "0"];
}

// ================================================
// TIMER — Sound / Notifications
// ================================================

const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  enabled: false,
  tickSound: "classic",
  volume: 0.5,
};

export function getSoundSettings(): SoundSettings {
  return { ...DEFAULT_SOUND_SETTINGS, ...(safeGet<SoundSettings>(KEYS.soundSettings) ?? {}) };
}

export function saveSoundSettings(settings: SoundSettings): void {
  safeSet(KEYS.soundSettings, settings);
}

export function getNotifiedKeys(): Set<string> {
  return new Set(safeGet<string[]>(KEYS.notifiedGoals) ?? []);
}

export function addNotifiedKey(key: string): void {
  const keys = getNotifiedKeys();
  keys.add(key);
  safeSet(KEYS.notifiedGoals, [...keys]);
}

// ================================================
// FOCUS — Sessions
// ================================================

export function getFocusSessions(): FocusSession[] {
  return safeGet<FocusSession[]>(KEYS.focusSessions) ?? [];
}

export function saveFocusSessions(sessions: FocusSession[]): void {
  safeSet(KEYS.focusSessions, sessions);
}

export function addFocusSession(session: Omit<FocusSession, "id">): FocusSession {
  const newSession: FocusSession = { ...session, id: crypto.randomUUID() };
  saveFocusSessions([...getFocusSessions(), newSession]);
  return newSession;
}

export function clearFocusSessions(): void {
  safeSet(KEYS.focusSessions, []);
}

// FOCUS — stats
export interface FocusStats {
  today: number;
  week: number;
  month: number;
  total: number;
  totalSessions: number;
}

export function getFocusStats(): FocusStats {
  const sessions = getFocusSessions();
  const todayStart = getTodayStart();
  const weekStart = todayStart - 6 * 86400000;
  const monthStart = todayStart - 29 * 86400000;

  let today = 0, week = 0, month = 0, total = 0;
  for (const s of sessions) {
    const ended = new Date(s.endedAt).getTime();
    total += s.duration;
    if (ended >= monthStart) month += s.duration;
    if (ended >= weekStart) week += s.duration;
    if (ended >= todayStart) today += s.duration;
  }
  return { today, week, month, total, totalSessions: sessions.length };
}

// FOCUS — daily breakdown / streak / tag stats
function startOfDay(d: Date): Date { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }

export function getDailyStats(days: number = 7): { date: string; duration: number }[] {
  const sessions = getFocusSessions();
  const now = new Date();
  const out: { date: string; duration: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    const ds = toLocalDateStr(d);
    const dayStart = startOfDay(d).getTime();
    const dayEnd = dayStart + 86400000;
    let duration = 0;
    for (const s of sessions) {
      const t = new Date(s.endedAt).getTime();
      if (t >= dayStart && t < dayEnd) duration += s.duration;
    }
    out.push({ date: ds, duration });
  }
  return out;
}

export function getStreak(): number {
  const sessions = getFocusSessions();
  if (sessions.length === 0) return 0;
  const daysWithSessions = new Set<string>();
  for (const s of sessions) daysWithSessions.add(toLocalDateStr(new Date(s.endedAt)));
  const d = new Date();
  if (!daysWithSessions.has(toLocalDateStr(d))) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (daysWithSessions.has(toLocalDateStr(d))) {
    streak++; d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function getTagStats(): Record<string, number> {
  const sessions = getFocusSessions();
  const result: Record<string, number> = {};
  for (const s of sessions) {
    const key = s.tag || "none";
    result[key] = (result[key] || 0) + s.duration;
  }
  return result;
}

// Aliases used by the legacy FOCUS code paths
export const getStats = getFocusStats;
export const getSessions = getFocusSessions;
export const clearSessions = clearFocusSessions;
export const addSession = addFocusSession;
export const getTags = getFocusTags;
export const saveTags = saveFocusTags;

// FOCUS — config, tags, sounds, daily goal
export function getTimerConfig(): TimerConfig {
  return { ...DEFAULT_TIMER_CONFIG, ...(safeGet<TimerConfig>(KEYS.focusTimerConfig) ?? {}) };
}
export function saveTimerConfig(c: TimerConfig): void { safeSet(KEYS.focusTimerConfig, c); }

export function getFocusTags(): CustomTag[] {
  return safeGet<CustomTag[]>(KEYS.focusTags) ?? DEFAULT_TAGS;
}
export function saveFocusTags(tags: CustomTag[]): void { safeSet(KEYS.focusTags, tags); }

export function getCompletionSound(): CompletionSoundType {
  return safeGet<CompletionSoundType>(KEYS.focusCompletionSound) ?? "celebration";
}
export function saveCompletionSound(s: CompletionSoundType): void { safeSet(KEYS.focusCompletionSound, s); }

export function getAmbientSettings(): AmbientSettings {
  return safeGet<AmbientSettings>(KEYS.focusAmbient) ?? { enabled: false, type: "thunder", volume: 0.3 };
}
export function saveAmbientSettings(s: AmbientSettings): void { safeSet(KEYS.focusAmbient, s); }

export function getDailyGoal(): DailyGoal {
  return safeGet<DailyGoal>(KEYS.focusDailyGoal) ?? { minutes: 0 };
}
export function saveDailyGoal(g: DailyGoal): void { safeSet(KEYS.focusDailyGoal, g); }

// ================================================
// TASK — Tasks & Milestones
// ================================================

export function getTasks(): Task[] {
  return safeGet<Task[]>(KEYS.taskTasks) ?? [];
}
export function saveTasks(tasks: Task[]): void { safeSet(KEYS.taskTasks, tasks); }

export function getMilestones(): Milestone[] {
  return safeGet<Milestone[]>(KEYS.taskMilestones) ?? [];
}
export function saveMilestones(m: Milestone[]): void { safeSet(KEYS.taskMilestones, m); }

// Tasks consumed by FOCUS (filter: active & not completed)
export function getEnsoTasksForFocus(): EnsoTask[] {
  const tasks = getTasks();
  return tasks
    .filter((t) => !t.completed && (!t.goalId || t.active === true))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(({ id, title, priority, completed }) => ({ id, title, priority, completed }));
}

// ================================================
// JOURNAL — Entries
// ================================================

export function getJournalEntries(): DailyJournal[] {
  return safeGet<DailyJournal[]>(KEYS.journalEntries) ?? [];
}
export function saveJournalEntries(entries: DailyJournal[]): void {
  safeSet(KEYS.journalEntries, entries);
}

// Shared helper: append a manual entry to today's journal
function appendTodayEntry(text: string, icon: ManualEntry["icon"]): void {
  if (!isBrowser()) return;
  const now = new Date();
  const todayStr = toLocalDateStr(now);
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const entries = getJournalEntries();

  const existing = entries.find((e) => e.date === todayStr);
  const newActivity: ManualEntry = {
    id: Date.now().toString(),
    time: timeStr,
    text,
    icon,
  };

  if (existing) {
    existing.manualEntries = existing.manualEntries ?? [];
    existing.manualEntries.push(newActivity);
    existing.updatedAt = now.toISOString();
  } else {
    entries.unshift({
      date: todayStr,
      notes: [],
      manualEntries: [newActivity],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  }
  saveJournalEntries(entries);
}

// Called from FOCUS on session completion
export function recordFocusToJournal(label: string, durationMin: number): void {
  appendTodayEntry(`${label} (${durationMin}min)`, "focus");
}

// Called from TASK on task completion
export function recordTaskToJournal(title: string): void {
  appendTodayEntry(title, "done");
}

// ================================================
// Dashboard aggregates (read-only views)
// ================================================

export function getFocusTodayMinutes(): number {
  const sessions = getFocusSessions();
  const todayStart = getTodayStart();
  return (
    sessions.filter((s) => new Date(s.endedAt).getTime() >= todayStart)
      .reduce((sum, s) => sum + s.duration, 0) / 60
  );
}

export function getFocusStreak(): number {
  const sessions = getFocusSessions();
  if (sessions.length === 0) return 0;
  const sessionDates = new Set(
    sessions.map((s) => toLocalDateStr(new Date(s.endedAt)))
  );
  let streak = 0;
  const check = new Date();
  check.setHours(0, 0, 0, 0);
  if (!sessionDates.has(toLocalDateStr(check))) {
    check.setDate(check.getDate() - 1);
  }
  while (sessionDates.has(toLocalDateStr(check))) {
    streak++;
    check.setDate(check.getDate() - 1);
  }
  return streak;
}

export function getTaskStats(): { active: number; completedToday: number } {
  const tasks = getTasks();
  const todayStr = getTodayString();
  return {
    active: tasks.filter((t) => !t.completed).length,
    completedToday: tasks.filter(
      (t) => t.completed && t.completedAt && t.completedAt.startsWith(todayStr)
    ).length,
  };
}

export interface GoalInfo {
  title: string;
  daysLeft: number;
}

export function getActiveGoalsInfo(): GoalInfo[] {
  const now = Date.now();
  return getActiveGoalsList()
    .map((g) => ({
      title: g.title,
      daysLeft: Math.max(0, Math.ceil((new Date(g.deadline).getTime() - now) / 86400000)),
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

export function getJournalToday(): { entries: number; mood: number | null } {
  const journals = getJournalEntries();
  const todayStr = getTodayString();
  const today = journals.find((j) => j.date === todayStr);
  if (!today) return { entries: 0, mood: null };
  return {
    entries: (today.manualEntries?.length ?? 0) + (today.notes?.length ?? 0),
    mood: today.mood ?? null,
  };
}

// ================================================
// Onboarding / Backup reminder
// ================================================

export function hasAnyData(): boolean {
  return (
    getGoals().length > 0 ||
    getTasks().length > 0 ||
    getFocusSessions().length > 0 ||
    getJournalEntries().length > 0
  );
}

const BACKUP_INTERVAL_DAYS = 7;

export function shouldShowBackupReminder(): boolean {
  if (!hasAnyData()) return false;
  const last = safeGet<number>(KEYS.backupReminder);
  if (!last) return true;
  const daysSince = (Date.now() - last) / 86400000;
  return daysSince >= BACKUP_INTERVAL_DAYS;
}

export function dismissBackupReminder(): void {
  safeSet(KEYS.backupReminder, Date.now());
}

// ================================================
// Unified Export / Import
// ================================================

export interface ExportBundle {
  version: "1.0";
  exportedAt: string;
  app: "enso-unified";
  data: Record<string, unknown>;
}

export function exportAllData(): string {
  const bundle: ExportBundle = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    app: "enso-unified",
    data: {},
  };
  for (const key of Object.values(KEYS)) {
    const raw = isBrowser() ? localStorage.getItem(key) : null;
    if (raw !== null) {
      try {
        bundle.data[key] = JSON.parse(raw);
      } catch {
        bundle.data[key] = raw;
      }
    }
  }
  return JSON.stringify(bundle, null, 2);
}

export function importAllData(json: string): boolean {
  if (!isBrowser()) return false;
  try {
    const parsed = JSON.parse(json) as unknown;
    // Accept both { version, data: {...} } bundle format and flat { key: value } format
    const payload = (parsed && typeof parsed === "object" && "data" in (parsed as Record<string, unknown>))
      ? (parsed as ExportBundle).data
      : (parsed as Record<string, unknown>);

    const validKeys = new Set<string>(Object.values(KEYS) as string[]);
    for (const [key, val] of Object.entries(payload)) {
      // Accept only known enso-* keys to avoid polluting localStorage
      if (validKeys.has(key) || key.startsWith("enso-")) {
        localStorage.setItem(key, JSON.stringify(val));
      }
    }
    return true;
  } catch {
    return false;
  }
}

export function clearAllData(): void {
  if (!isBrowser()) return;
  for (const key of Object.values(KEYS)) {
    localStorage.removeItem(key);
  }
}

// ================================================
// Cross-app aliases (used by dashboard / onboarding)
// ================================================

// Alias for backward-compatible dashboard API
export const getActiveGoals = getActiveGoalsInfo;
