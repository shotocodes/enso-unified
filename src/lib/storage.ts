// ================================================
// ENSO Unified - Storage dispatcher (public API)
// ================================================
//
// Thin facade that:
//   1) Reads/writes through `store/local.ts` (localStorage)
//   2) When `setSyncUserId(userId)` has been called (i.e. logged in), also
//      fires-and-forgets the write to Supabase via `store/sync.ts`.
//
// The public API is unchanged, so no component has to be updated.

import type {
  AmbientSettings, CompletionSoundType, CustomTag, DailyGoal, DailyJournal,
  FocusSession, Goal, LifeConfig, Locale, Milestone, NotifyTiming, SoundSettings,
  Task, ThemeMode, TimerConfig,
} from "@/types";
import * as local from "./store/local";
import * as sync from "./store/sync";

// Re-export everything from local for read-only helpers + types
export type { GoalInfo } from "./store/local";
export type { ExportBundle } from "./store/local";
export { KEYS, migrateLegacyStorage } from "./store/local";

// ================================================
// Current signed-in user (set by AppShell)
// ================================================

let currentUserId: string | null = null;

export function setSyncUserId(userId: string | null): void {
  currentUserId = userId;
}

function user(): string | null {
  return currentUserId;
}

// ================================================
// Theme / locale (profile KV)
// ================================================

export function getTheme(): ThemeMode {
  return local.getTheme();
}
export function saveTheme(theme: ThemeMode): void {
  local.saveTheme(theme);
  const uid = user();
  if (uid) sync.pushProfilePatch(uid, { theme });
}
export function getLocale(): Locale {
  return local.getLocale();
}
export function saveLocale(locale: Locale): void {
  local.saveLocale(locale);
  const uid = user();
  if (uid) sync.pushProfilePatch(uid, { locale });
}

// ================================================
// TIMER — Life config
// ================================================

export function getLifeConfig(): LifeConfig | null {
  return local.getLifeConfig();
}
export function saveLifeConfig(config: LifeConfig): void {
  local.saveLifeConfig(config);
  const uid = user();
  if (uid) sync.pushProfilePatch(uid, { life_config: config });
}

// ================================================
// TIMER — Goals
// ================================================

export function getGoals(): Goal[] {
  return local.getGoals();
}
export function saveGoals(goals: Goal[]): void {
  local.saveGoals(goals);
  const uid = user();
  if (uid) sync.pushGoals(uid, goals);
}
export function addGoal(goal: Omit<Goal, "id" | "createdAt">): Goal {
  const newGoal = local.addGoal(goal);
  const uid = user();
  if (uid) sync.pushGoals(uid, [newGoal]);
  return newGoal;
}
export function updateGoal(
  id: string,
  updates: Partial<Pick<Goal, "title" | "deadline" | "notifyTimings">>
): void {
  local.updateGoal(id, updates);
  const uid = user();
  if (uid) {
    const goals = local.getGoals();
    sync.pushGoals(uid, goals);
  }
}
export function deleteGoal(id: string): void {
  local.deleteGoal(id);
  const uid = user();
  if (uid) sync.pushGoalDelete(id);
}
export function achieveGoal(id: string, memo?: string): Goal | null {
  const g = local.achieveGoal(id, memo);
  const uid = user();
  if (uid && g) sync.pushGoals(uid, [g]);
  return g;
}
export function unachieveGoal(id: string): void {
  local.unachieveGoal(id);
  const uid = user();
  if (uid) {
    const goal = local.getGoals().find((g) => g.id === id);
    if (goal) sync.pushGoals(uid, [goal]);
  }
}
export function getActiveGoalsList(): Goal[] {
  return local.getActiveGoalsList();
}
export function getAchievedGoals(): Goal[] {
  return local.getAchievedGoals();
}
export function getDefaultNotifyTimings(deadlineISO: string): NotifyTiming[] {
  return local.getDefaultNotifyTimings(deadlineISO);
}

// ================================================
// TIMER — Sound / notify
// ================================================

export function getSoundSettings(): SoundSettings {
  return local.getSoundSettings();
}
export function saveSoundSettings(settings: SoundSettings): void {
  local.saveSoundSettings(settings);
  const uid = user();
  if (uid) sync.pushProfilePatch(uid, { sound_settings: settings });
}
export function getNotifiedKeys(): Set<string> {
  return local.getNotifiedKeys();
}
export function addNotifiedKey(key: string): void {
  local.addNotifiedKey(key);
  // Notified keys are device-local — don't sync
}

// ================================================
// FOCUS — sessions
// ================================================

export function getFocusSessions(): FocusSession[] {
  return local.getFocusSessions();
}
export function saveFocusSessions(sessions: FocusSession[]): void {
  local.saveFocusSessions(sessions);
  const uid = user();
  if (uid) sync.pushFocusSessions(uid, sessions);
}
export function addFocusSession(session: Omit<FocusSession, "id">): FocusSession {
  const added = local.addFocusSession(session);
  const uid = user();
  if (uid) sync.pushFocusSessions(uid, [added]);
  return added;
}
export function clearFocusSessions(): void {
  local.clearFocusSessions();
  // TODO(v2): also clear on Supabase — for now caller handles it
}

export type FocusStats = local.FocusStats;
export const getFocusStats = local.getFocusStats;
export const getStats = local.getStats;
export const getSessions = local.getSessions;
export const clearSessions = local.clearSessions;
export const addSession = local.addSession;

// FOCUS — config / tags / sounds / daily goal
export function getTimerConfig(): TimerConfig {
  return local.getTimerConfig();
}
export function saveTimerConfig(c: TimerConfig): void {
  local.saveTimerConfig(c);
  const uid = user();
  if (uid) sync.pushProfilePatch(uid, { timer_config: c });
}
export function getFocusTags(): CustomTag[] {
  return local.getFocusTags();
}
export function saveFocusTags(tags: CustomTag[]): void {
  local.saveFocusTags(tags);
  const uid = user();
  if (uid) sync.pushProfilePatch(uid, { focus_tags: tags });
}
export const getTags = local.getTags;
export const saveTags = saveFocusTags;
export function getCompletionSound(): CompletionSoundType {
  return local.getCompletionSound();
}
export function saveCompletionSound(s: CompletionSoundType): void {
  local.saveCompletionSound(s);
  const uid = user();
  if (uid) sync.pushProfilePatch(uid, { completion_sound: s });
}
export function getAmbientSettings(): AmbientSettings {
  return local.getAmbientSettings();
}
export function saveAmbientSettings(s: AmbientSettings): void {
  local.saveAmbientSettings(s);
  const uid = user();
  if (uid) sync.pushProfilePatch(uid, { ambient_settings: s });
}
export function getDailyGoal(): DailyGoal {
  return local.getDailyGoal();
}
export function saveDailyGoal(g: DailyGoal): void {
  local.saveDailyGoal(g);
  const uid = user();
  if (uid) sync.pushProfilePatch(uid, { daily_goal: g });
}

// FOCUS — read-only stats helpers
export const getDailyStats = local.getDailyStats;
export const getStreak = local.getStreak;
export const getTagStats = local.getTagStats;

// ================================================
// TASK
// ================================================

export function getTasks(): Task[] {
  return local.getTasks();
}
export function saveTasks(tasks: Task[]): void {
  local.saveTasks(tasks);
  const uid = user();
  if (uid) sync.pushTasks(uid, tasks);
}
export function getMilestones(): Milestone[] {
  return local.getMilestones();
}
export function saveMilestones(m: Milestone[]): void {
  local.saveMilestones(m);
  const uid = user();
  if (uid) sync.pushMilestones(uid, m);
}
export function getEnsoTasksForFocus() {
  return local.getEnsoTasksForFocus();
}

// ================================================
// JOURNAL
// ================================================

export function getJournalEntries(): DailyJournal[] {
  return local.getJournalEntries();
}
export function saveJournalEntries(entries: DailyJournal[]): void {
  local.saveJournalEntries(entries);
  const uid = user();
  if (uid) sync.pushJournalEntries(uid, entries);
}
export function recordFocusToJournal(label: string, durationMin: number): void {
  local.recordFocusToJournal(label, durationMin);
  const uid = user();
  if (uid) {
    // Re-push today's entry only
    const today = local.getJournalEntries().slice(0, 1);
    sync.pushJournalEntries(uid, today);
  }
}
export function recordTaskToJournal(title: string): void {
  local.recordTaskToJournal(title);
  const uid = user();
  if (uid) {
    const today = local.getJournalEntries().slice(0, 1);
    sync.pushJournalEntries(uid, today);
  }
}

// ================================================
// Dashboard aggregates (read-only)
// ================================================

export const getFocusTodayMinutes = local.getFocusTodayMinutes;
export const getFocusStreak = local.getFocusStreak;
export const getTaskStats = local.getTaskStats;
export const getActiveGoalsInfo = local.getActiveGoalsInfo;
export const getActiveGoals = local.getActiveGoals;
export const getJournalToday = local.getJournalToday;

// ================================================
// Onboarding / backup
// ================================================

export const hasAnyData = local.hasAnyData;
export const shouldShowBackupReminder = local.shouldShowBackupReminder;
export const dismissBackupReminder = local.dismissBackupReminder;

// ================================================
// Import / Export / Clear
// ================================================

export const exportAllData = local.exportAllData;
export function importAllData(json: string): boolean {
  const ok = local.importAllData(json);
  // Caller should call pullAll() / performInitialSync() subsequently if signed in
  return ok;
}
export function clearAllData(): void {
  local.clearAllData();
  // Note: does NOT clear cloud. User should explicitly delete their account for that.
}

// ================================================
// Sync control (for AppShell)
// ================================================

export { performInitialSync, pullAll } from "./store/sync";
export type { InitialSyncResult } from "./store/sync";
