// ================================================
// ENSO Unified - Supabase store
// ================================================
//
// Cloud persistence layer. Writes always go through `upsertXxx()` which
// is idempotent and safe to retry. All rows are scoped by the authenticated
// user via RLS — callers don't need to pass user_id.
//
// Design notes:
//  - This module intentionally does NOT cache. It's a thin mapper.
//  - Sync layer (store/sync.ts) orchestrates local <-> cloud reconciliation.
//  - Snake_case ↔ camelCase conversion happens here so the rest of the app
//    can keep using the existing TS interfaces from @/types.

import type {
  AmbientSettings, CompletionSoundType, CustomTag, DailyGoal, DailyJournal,
  FocusSession, Goal, LifeConfig, Locale, Milestone, NotifyTiming, SoundSettings,
  Task, ThemeMode, TimerConfig,
} from "@/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SupabaseClient = ReturnType<typeof createSupabaseBrowserClient>;

function client(): SupabaseClient {
  return createSupabaseBrowserClient();
}

// ================================================
// Profile (KV row — one per user)
// ================================================

export interface ProfileRow {
  theme: ThemeMode;
  locale: Locale;
  life_config: LifeConfig | null;
  sound_settings: SoundSettings | null;
  timer_config: TimerConfig | null;
  ambient_settings: AmbientSettings | null;
  completion_sound: CompletionSoundType | null;
  daily_goal: DailyGoal | null;
  focus_tags: CustomTag[] | null;
}

export async function fetchProfile(): Promise<Partial<ProfileRow> | null> {
  const { data, error } = await client().from("profiles").select("*").maybeSingle();
  if (error) {
    console.warn("[supabase] fetchProfile:", error.message);
    return null;
  }
  return data;
}

export async function upsertProfile(userId: string, patch: Partial<ProfileRow>): Promise<void> {
  const { error } = await client().from("profiles").upsert({ user_id: userId, ...patch });
  if (error) console.warn("[supabase] upsertProfile:", error.message);
}

// ================================================
// Goals
// ================================================

interface GoalRow {
  id: string;
  user_id: string;
  title: string;
  deadline: string;
  achieved_at: string | null;
  memo: string | null;
  notify_timings: NotifyTiming[] | null;
  created_at: string;
  updated_at: string;
}

function goalFromRow(r: GoalRow): Goal {
  return {
    id: r.id,
    title: r.title,
    deadline: r.deadline,
    createdAt: r.created_at,
    achievedAt: r.achieved_at ?? undefined,
    memo: r.memo ?? undefined,
    notifyTimings: r.notify_timings ?? undefined,
  };
}

function goalToRow(userId: string, g: Goal) {
  return {
    id: g.id,
    user_id: userId,
    title: g.title,
    deadline: g.deadline,
    achieved_at: g.achievedAt ?? null,
    memo: g.memo ?? null,
    notify_timings: g.notifyTimings ?? null,
    created_at: g.createdAt,
  };
}

export async function fetchGoals(): Promise<Goal[]> {
  const { data, error } = await client().from("goals").select("*");
  if (error) {
    console.warn("[supabase] fetchGoals:", error.message);
    return [];
  }
  return (data as GoalRow[]).map(goalFromRow);
}

export async function upsertGoals(userId: string, goals: Goal[]): Promise<void> {
  if (goals.length === 0) return;
  const { error } = await client().from("goals").upsert(goals.map((g) => goalToRow(userId, g)));
  if (error) console.warn("[supabase] upsertGoals:", error.message);
}

export async function deleteGoalRemote(id: string): Promise<void> {
  const { error } = await client().from("goals").delete().eq("id", id);
  if (error) console.warn("[supabase] deleteGoal:", error.message);
}

export async function deleteGoalsRemote(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await client().from("goals").delete().in("id", ids);
  if (error) console.warn("[supabase] deleteGoals:", error.message);
}

// ================================================
// Milestones
// ================================================

interface MilestoneRow {
  id: string;
  user_id: string;
  goal_id: string;
  title: string;
  due_date: string;
  completed: boolean;
  completed_at: string | null;
  sort_order: number;
}

function milestoneFromRow(r: MilestoneRow): Milestone {
  return {
    id: r.id,
    goalId: r.goal_id,
    title: r.title,
    dueDate: r.due_date,
    completed: r.completed,
    completedAt: r.completed_at ?? undefined,
    order: r.sort_order,
  };
}

function milestoneToRow(userId: string, m: Milestone) {
  return {
    id: m.id,
    user_id: userId,
    goal_id: m.goalId,
    title: m.title,
    due_date: m.dueDate,
    completed: m.completed,
    completed_at: m.completedAt ?? null,
    sort_order: m.order,
  };
}

export async function fetchMilestones(): Promise<Milestone[]> {
  const { data, error } = await client().from("milestones").select("*");
  if (error) {
    console.warn("[supabase] fetchMilestones:", error.message);
    return [];
  }
  return (data as MilestoneRow[]).map(milestoneFromRow);
}

export async function upsertMilestones(userId: string, items: Milestone[]): Promise<void> {
  if (items.length === 0) return;
  const { error } = await client().from("milestones").upsert(items.map((m) => milestoneToRow(userId, m)));
  if (error) console.warn("[supabase] upsertMilestones:", error.message);
}

export async function deleteMilestonesRemote(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await client().from("milestones").delete().in("id", ids);
  if (error) console.warn("[supabase] deleteMilestones:", error.message);
}

// ================================================
// Tasks
// ================================================

interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: "high" | "medium" | "low";
  due_date: string | null;
  goal_id: string | null;
  milestone_id: string | null;
  completed: boolean;
  completed_at: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

function taskFromRow(r: TaskRow): Task {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? undefined,
    priority: r.priority,
    dueDate: r.due_date ?? undefined,
    goalId: r.goal_id ?? undefined,
    milestoneId: r.milestone_id ?? undefined,
    completed: r.completed,
    completedAt: r.completed_at ?? undefined,
    order: r.sort_order,
    active: r.active,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function taskToRow(userId: string, t: Task) {
  return {
    id: t.id,
    user_id: userId,
    title: t.title,
    description: t.description ?? null,
    priority: t.priority,
    due_date: t.dueDate ?? null,
    goal_id: t.goalId ?? null,
    milestone_id: t.milestoneId ?? null,
    completed: t.completed,
    completed_at: t.completedAt ?? null,
    sort_order: t.order,
    active: t.active ?? true,
    created_at: t.createdAt,
    updated_at: t.updatedAt,
  };
}

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await client().from("tasks").select("*");
  if (error) {
    console.warn("[supabase] fetchTasks:", error.message);
    return [];
  }
  return (data as TaskRow[]).map(taskFromRow);
}

export async function upsertTasks(userId: string, tasks: Task[]): Promise<void> {
  if (tasks.length === 0) return;
  const { error } = await client().from("tasks").upsert(tasks.map((t) => taskToRow(userId, t)));
  if (error) console.warn("[supabase] upsertTasks:", error.message);
}

export async function deleteTasksRemote(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await client().from("tasks").delete().in("id", ids);
  if (error) console.warn("[supabase] deleteTasks:", error.message);
}

// ================================================
// Focus sessions
// ================================================

interface FocusSessionRow {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string;
  duration: number;
  tag: string | null;
  memo: string | null;
  task_id: string | null;
  task_title: string | null;
}

function sessionFromRow(r: FocusSessionRow): FocusSession {
  return {
    id: r.id,
    startedAt: r.started_at,
    endedAt: r.ended_at,
    duration: r.duration,
    tag: r.tag ?? undefined,
    memo: r.memo ?? undefined,
    taskId: r.task_id ?? undefined,
    taskTitle: r.task_title ?? undefined,
  };
}

function sessionToRow(userId: string, s: FocusSession) {
  return {
    id: s.id,
    user_id: userId,
    started_at: s.startedAt,
    ended_at: s.endedAt,
    duration: s.duration,
    tag: s.tag ?? null,
    memo: s.memo ?? null,
    task_id: s.taskId ?? null,
    task_title: s.taskTitle ?? null,
  };
}

export async function fetchFocusSessions(): Promise<FocusSession[]> {
  const { data, error } = await client().from("focus_sessions").select("*").order("ended_at", { ascending: false });
  if (error) {
    console.warn("[supabase] fetchFocusSessions:", error.message);
    return [];
  }
  return (data as FocusSessionRow[]).map(sessionFromRow);
}

export async function upsertFocusSessions(userId: string, sessions: FocusSession[]): Promise<void> {
  if (sessions.length === 0) return;
  const { error } = await client().from("focus_sessions").upsert(sessions.map((s) => sessionToRow(userId, s)));
  if (error) console.warn("[supabase] upsertFocusSessions:", error.message);
}

export async function deleteFocusSessionsRemote(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await client().from("focus_sessions").delete().in("id", ids);
  if (error) console.warn("[supabase] deleteFocusSessions:", error.message);
}

export async function deleteAllFocusSessionsRemote(userId: string): Promise<void> {
  const { error } = await client().from("focus_sessions").delete().eq("user_id", userId);
  if (error) console.warn("[supabase] deleteAllFocusSessions:", error.message);
}

// ================================================
// Journal entries
// ================================================

interface JournalRow {
  user_id: string;
  date: string;
  mood: 1 | 2 | 3 | 4 | 5 | null;
  comment: string | null;
  notes: string[] | null;
  ai_summary: string | null;
  manual_entries: DailyJournal["manualEntries"] | null;
  created_at: string;
  updated_at: string;
}

function journalFromRow(r: JournalRow): DailyJournal {
  return {
    date: r.date,
    mood: r.mood ?? undefined,
    comment: r.comment ?? undefined,
    notes: r.notes ?? [],
    aiSummary: r.ai_summary ?? undefined,
    manualEntries: r.manual_entries ?? [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function journalToRow(userId: string, j: DailyJournal) {
  return {
    user_id: userId,
    date: j.date,
    mood: j.mood ?? null,
    comment: j.comment ?? null,
    notes: j.notes ?? [],
    ai_summary: j.aiSummary ?? null,
    manual_entries: j.manualEntries ?? [],
    created_at: j.createdAt,
    updated_at: j.updatedAt,
  };
}

export async function fetchJournalEntries(): Promise<DailyJournal[]> {
  const { data, error } = await client().from("journal_entries").select("*").order("date", { ascending: false });
  if (error) {
    console.warn("[supabase] fetchJournalEntries:", error.message);
    return [];
  }
  return (data as JournalRow[]).map(journalFromRow);
}

export async function upsertJournalEntries(userId: string, entries: DailyJournal[]): Promise<void> {
  if (entries.length === 0) return;
  const { error } = await client().from("journal_entries").upsert(entries.map((j) => journalToRow(userId, j)));
  if (error) console.warn("[supabase] upsertJournalEntries:", error.message);
}

export async function deleteJournalEntriesRemote(dates: string[]): Promise<void> {
  if (dates.length === 0) return;
  const { error } = await client().from("journal_entries").delete().in("date", dates);
  if (error) console.warn("[supabase] deleteJournalEntries:", error.message);
}
