// ================================================
// ENSO Unified - Sync layer (local ↔ cloud)
// ================================================
//
// Orchestrates reconciliation between localStorage and Supabase when the
// user is signed in. Strategy:
//
//   On sign-in (first time on this device for this user):
//     1) Fetch everything from Supabase in parallel.
//     2) If Supabase has ANY data for this user → treat cloud as source of
//        truth and overwrite localStorage. (Protects against a fresh device
//        clobbering cloud data.)
//     3) If Supabase is empty → upload everything from localStorage.
//     4) Mark "sync-done" flag so subsequent reloads skip migration.
//
//   After first sync:
//     - Writes go to localStorage immediately (for UX speed), then
//       fire-and-forget to Supabase.
//     - On focus / visibility change, re-pull from Supabase (cheap refresh).

import type { User } from "@supabase/supabase-js";
import type {
  CustomTag, DailyJournal, FocusSession, Goal, Milestone, Task,
} from "@/types";
import * as local from "./local";
import * as cloud from "./supabase";

// ================================================
// Sync-done flag (per user, per device)
// ================================================

function syncDoneKey(userId: string): string {
  return `enso-sync-done-${userId}`;
}

function isSyncDone(userId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(syncDoneKey(userId)) === "1";
}

function markSyncDone(userId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(syncDoneKey(userId), "1");
}

// ================================================
// Initial sync (on first sign-in on this device)
// ================================================

export interface InitialSyncResult {
  status: "skipped" | "uploaded" | "downloaded" | "error";
  message?: string;
}

export async function performInitialSync(user: User): Promise<InitialSyncResult> {
  if (isSyncDone(user.id)) return { status: "skipped" };

  try {
    // Fetch everything in parallel
    const [profile, goals, milestones, tasks, sessions, journals] = await Promise.all([
      cloud.fetchProfile(),
      cloud.fetchGoals(),
      cloud.fetchMilestones(),
      cloud.fetchTasks(),
      cloud.fetchFocusSessions(),
      cloud.fetchJournalEntries(),
    ]);

    const cloudHasData =
      (goals.length ?? 0) > 0 ||
      (milestones.length ?? 0) > 0 ||
      (tasks.length ?? 0) > 0 ||
      (sessions.length ?? 0) > 0 ||
      (journals.length ?? 0) > 0 ||
      (profile && (profile.life_config || profile.focus_tags));

    if (cloudHasData) {
      // DOWNLOAD: cloud is authoritative, overwrite local
      local.saveGoals(goals);
      local.saveMilestones(milestones);
      local.saveTasks(tasks);
      local.saveFocusSessions(sessions);
      local.saveJournalEntries(journals);

      if (profile) {
        if (profile.life_config) local.saveLifeConfig(profile.life_config);
        if (profile.sound_settings) local.saveSoundSettings(profile.sound_settings);
        if (profile.timer_config) local.saveTimerConfig(profile.timer_config);
        if (profile.ambient_settings) local.saveAmbientSettings(profile.ambient_settings);
        if (profile.completion_sound) local.saveCompletionSound(profile.completion_sound);
        if (profile.daily_goal) local.saveDailyGoal(profile.daily_goal);
        if (profile.focus_tags) local.saveFocusTags(profile.focus_tags);
      }
      markSyncDone(user.id);
      return { status: "downloaded" };
    }

    // UPLOAD: cloud is empty, push local to cloud
    const localGoals = local.getGoals();
    const localMilestones = local.getMilestones();
    const localTasks = local.getTasks();
    const localSessions = local.getFocusSessions();
    const localJournals = local.getJournalEntries();
    const localLifeConfig = local.getLifeConfig();
    const localSoundSettings = local.getSoundSettings();
    const localTimerConfig = local.getTimerConfig();
    const localAmbient = local.getAmbientSettings();
    const localCompletionSound = local.getCompletionSound();
    const localDailyGoal = local.getDailyGoal();
    const localFocusTags = local.getFocusTags();

    await Promise.all([
      cloud.upsertProfile(user.id, {
        theme: local.getTheme(),
        locale: local.getLocale(),
        life_config: localLifeConfig,
        sound_settings: localSoundSettings,
        timer_config: localTimerConfig,
        ambient_settings: localAmbient,
        completion_sound: localCompletionSound,
        daily_goal: localDailyGoal,
        focus_tags: localFocusTags,
      }),
      cloud.upsertGoals(user.id, localGoals),
      cloud.upsertMilestones(user.id, localMilestones),
      cloud.upsertTasks(user.id, localTasks),
      cloud.upsertFocusSessions(user.id, localSessions),
      cloud.upsertJournalEntries(user.id, localJournals),
    ]);

    markSyncDone(user.id);
    return { status: "uploaded" };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.warn("[sync] performInitialSync failed:", message);
    return { status: "error", message };
  }
}

// ================================================
// Fire-and-forget cloud writes
// Used by the storage.ts dispatcher after a local write succeeds.
// Failures are swallowed — local is still correct, we'll retry on next focus.
// ================================================

function safely(promise: Promise<unknown>, label: string): void {
  promise.catch((e) => console.warn(`[sync] ${label} failed:`, e));
}

export function pushGoals(userId: string, goals: Goal[]): void {
  safely(cloud.upsertGoals(userId, goals), "pushGoals");
}

export function pushGoalDelete(id: string): void {
  safely(cloud.deleteGoalRemote(id), "pushGoalDelete");
}

export function pushMilestones(userId: string, items: Milestone[]): void {
  safely(cloud.upsertMilestones(userId, items), "pushMilestones");
}

export function pushTasks(userId: string, tasks: Task[]): void {
  safely(cloud.upsertTasks(userId, tasks), "pushTasks");
}

export function pushFocusSessions(userId: string, sessions: FocusSession[]): void {
  safely(cloud.upsertFocusSessions(userId, sessions), "pushFocusSessions");
}

export function pushJournalEntries(userId: string, entries: DailyJournal[]): void {
  safely(cloud.upsertJournalEntries(userId, entries), "pushJournalEntries");
}

// Profile-level writes (batched single row)
export function pushProfilePatch(userId: string, patch: Partial<cloud.ProfileRow>): void {
  safely(cloud.upsertProfile(userId, patch), "pushProfilePatch");
}

// ================================================
// Incremental re-sync (called on focus / visibility change when logged in)
// Fetches fresh data from cloud and overwrites local. Cheap read.
// ================================================

export async function pullAll(): Promise<void> {
  try {
    const [profile, goals, milestones, tasks, sessions, journals] = await Promise.all([
      cloud.fetchProfile(),
      cloud.fetchGoals(),
      cloud.fetchMilestones(),
      cloud.fetchTasks(),
      cloud.fetchFocusSessions(),
      cloud.fetchJournalEntries(),
    ]);
    local.saveGoals(goals);
    local.saveMilestones(milestones);
    local.saveTasks(tasks);
    local.saveFocusSessions(sessions);
    local.saveJournalEntries(journals);
    if (profile) {
      if (profile.life_config) local.saveLifeConfig(profile.life_config);
      if (profile.sound_settings) local.saveSoundSettings(profile.sound_settings);
      if (profile.timer_config) local.saveTimerConfig(profile.timer_config);
      if (profile.ambient_settings) local.saveAmbientSettings(profile.ambient_settings);
      if (profile.completion_sound) local.saveCompletionSound(profile.completion_sound);
      if (profile.daily_goal) local.saveDailyGoal(profile.daily_goal);
      if (profile.focus_tags) local.saveFocusTags(profile.focus_tags as CustomTag[]);
    }
  } catch (e) {
    console.warn("[sync] pullAll failed:", e);
  }
}
