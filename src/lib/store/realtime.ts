// ================================================
// ENSO Unified - Realtime sync
// ================================================
//
// Subscribes to postgres_changes for all user tables via a single channel.
// When changes arrive from the cloud (from another tab or device), merges
// them into local storage and dispatches `enso:remote-change` so pages
// can re-render.
//
// Self-echoes (the same write bouncing back) are suppressed via a
// short-lived "intent registry".

import type { RealtimeChannel } from "@supabase/supabase-js";
import type {
  AmbientSettings, CompletionSoundType, CustomTag, DailyGoal, DailyJournal,
  FocusSession, Goal, LifeConfig, Milestone, SoundSettings, Task, TimerConfig,
} from "@/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import * as local from "./local";

type SupabaseClient = ReturnType<typeof createSupabaseBrowserClient>;

// ================================================
// Echo suppression
// ================================================
//
// Before writing to Supabase, callers do `markIntent(key)`. When the same
// key comes back via Realtime within ECHO_WINDOW_MS, we treat it as an
// echo and skip the local merge.

const INTENT_WINDOW_MS = 5000;
const pendingIntents = new Map<string, number>();

export function markIntent(key: string): void {
  pendingIntents.set(key, Date.now());
  // Garbage-collect old entries
  const cutoff = Date.now() - INTENT_WINDOW_MS * 2;
  for (const [k, t] of pendingIntents) {
    if (t < cutoff) pendingIntents.delete(k);
  }
}

function consumeIntent(key: string): boolean {
  const ts = pendingIntents.get(key);
  if (ts === undefined) return false;
  pendingIntents.delete(key);
  return Date.now() - ts < INTENT_WINDOW_MS;
}

// ================================================
// Emit helper
// ================================================

function emitRemoteChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("enso:remote-change"));
}

// ================================================
// Row handlers (apply remote event to localStorage)
// ================================================

interface GoalRow {
  id: string; title: string; deadline: string; achieved_at: string | null;
  memo: string | null; notify_timings: Goal["notifyTimings"] | null; created_at: string;
}
function goalFromRow(r: GoalRow): Goal {
  return {
    id: r.id, title: r.title, deadline: r.deadline, createdAt: r.created_at,
    achievedAt: r.achieved_at ?? undefined, memo: r.memo ?? undefined,
    notifyTimings: r.notify_timings ?? undefined,
  };
}

interface MilestoneRow {
  id: string; goal_id: string; title: string; due_date: string;
  completed: boolean; completed_at: string | null; sort_order: number;
}
function milestoneFromRow(r: MilestoneRow): Milestone {
  return {
    id: r.id, goalId: r.goal_id, title: r.title, dueDate: r.due_date,
    completed: r.completed, completedAt: r.completed_at ?? undefined, order: r.sort_order,
  };
}

interface TaskRow {
  id: string; title: string; description: string | null;
  priority: "high" | "medium" | "low"; due_date: string | null;
  goal_id: string | null; milestone_id: string | null;
  completed: boolean; completed_at: string | null;
  sort_order: number; active: boolean; created_at: string; updated_at: string;
}
function taskFromRow(r: TaskRow): Task {
  return {
    id: r.id, title: r.title, description: r.description ?? undefined,
    priority: r.priority, dueDate: r.due_date ?? undefined,
    goalId: r.goal_id ?? undefined, milestoneId: r.milestone_id ?? undefined,
    completed: r.completed, completedAt: r.completed_at ?? undefined,
    order: r.sort_order, active: r.active,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

interface FocusSessionRow {
  id: string; started_at: string; ended_at: string; duration: number;
  tag: string | null; memo: string | null;
  task_id: string | null; task_title: string | null;
}
function sessionFromRow(r: FocusSessionRow): FocusSession {
  return {
    id: r.id, startedAt: r.started_at, endedAt: r.ended_at, duration: r.duration,
    tag: r.tag ?? undefined, memo: r.memo ?? undefined,
    taskId: r.task_id ?? undefined, taskTitle: r.task_title ?? undefined,
  };
}

interface JournalRow {
  date: string; mood: 1 | 2 | 3 | 4 | 5 | null;
  comment: string | null; notes: string[] | null;
  ai_summary: string | null; manual_entries: DailyJournal["manualEntries"] | null;
  created_at: string; updated_at: string;
}
function journalFromRow(r: JournalRow): DailyJournal {
  return {
    date: r.date, mood: r.mood ?? undefined, comment: r.comment ?? undefined,
    notes: r.notes ?? [], aiSummary: r.ai_summary ?? undefined,
    manualEntries: r.manual_entries ?? [],
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

interface ProfileRow {
  theme: "dark" | "light" | "system" | null;
  locale: "ja" | "en" | "zh" | "ko" | null;
  life_config: LifeConfig | null;
  sound_settings: SoundSettings | null;
  timer_config: TimerConfig | null;
  ambient_settings: AmbientSettings | null;
  completion_sound: CompletionSoundType | null;
  daily_goal: DailyGoal | null;
  focus_tags: CustomTag[] | null;
}

// ================================================
// Generic upsert into array by id
// ================================================

function upsertById<T extends { id: string }>(arr: T[], item: T): T[] {
  const idx = arr.findIndex((x) => x.id === item.id);
  if (idx === -1) return [...arr, item];
  const next = arr.slice();
  next[idx] = item;
  return next;
}

function removeById<T extends { id: string }>(arr: T[], id: string): T[] {
  return arr.filter((x) => x.id !== id);
}

// ================================================
// Subscribe
// ================================================

export interface RealtimeHandle {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

export function subscribeAll(userId: string): RealtimeHandle {
  const supabase: SupabaseClient = createSupabaseBrowserClient();
  const filter = `user_id=eq.${userId}`;
  const channel = supabase.channel(`enso-sync-${userId}`);

  // ---- goals ----
  channel.on("postgres_changes", { event: "*", schema: "public", table: "goals", filter }, (payload) => {
    const eventType = payload.eventType;
    const next = (payload.new ?? {}) as GoalRow;
    const old = (payload.old ?? {}) as { id?: string };
    const id = eventType === "DELETE" ? old.id : next.id;
    if (!id || consumeIntent(`goals:${id}`)) return;

    const current = local.getGoals();
    if (eventType === "DELETE") {
      local.saveGoals(removeById(current, id));
    } else {
      local.saveGoals(upsertById(current, goalFromRow(next)));
    }
    emitRemoteChange();
  });

  // ---- milestones ----
  channel.on("postgres_changes", { event: "*", schema: "public", table: "milestones", filter }, (payload) => {
    const eventType = payload.eventType;
    const next = (payload.new ?? {}) as MilestoneRow;
    const old = (payload.old ?? {}) as { id?: string };
    const id = eventType === "DELETE" ? old.id : next.id;
    if (!id || consumeIntent(`milestones:${id}`)) return;

    const current = local.getMilestones();
    if (eventType === "DELETE") {
      local.saveMilestones(removeById(current, id));
    } else {
      local.saveMilestones(upsertById(current, milestoneFromRow(next)));
    }
    emitRemoteChange();
  });

  // ---- tasks ----
  channel.on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter }, (payload) => {
    const eventType = payload.eventType;
    const next = (payload.new ?? {}) as TaskRow;
    const old = (payload.old ?? {}) as { id?: string };
    const id = eventType === "DELETE" ? old.id : next.id;
    if (!id || consumeIntent(`tasks:${id}`)) return;

    const current = local.getTasks();
    if (eventType === "DELETE") {
      local.saveTasks(removeById(current, id));
    } else {
      local.saveTasks(upsertById(current, taskFromRow(next)));
    }
    emitRemoteChange();
  });

  // ---- focus_sessions ----
  channel.on("postgres_changes", { event: "*", schema: "public", table: "focus_sessions", filter }, (payload) => {
    const eventType = payload.eventType;
    const next = (payload.new ?? {}) as FocusSessionRow;
    const old = (payload.old ?? {}) as { id?: string };
    const id = eventType === "DELETE" ? old.id : next.id;
    if (!id || consumeIntent(`focus_sessions:${id}`)) return;

    const current = local.getFocusSessions();
    if (eventType === "DELETE") {
      local.saveFocusSessions(removeById(current, id));
    } else {
      local.saveFocusSessions(upsertById(current, sessionFromRow(next)));
    }
    emitRemoteChange();
  });

  // ---- journal_entries (PK is (user_id, date), not id) ----
  channel.on("postgres_changes", { event: "*", schema: "public", table: "journal_entries", filter }, (payload) => {
    const eventType = payload.eventType;
    const next = (payload.new ?? {}) as JournalRow;
    const old = (payload.old ?? {}) as { date?: string };
    const date = eventType === "DELETE" ? old.date : next.date;
    if (!date || consumeIntent(`journal:${date}`)) return;

    const current = local.getJournalEntries();
    if (eventType === "DELETE") {
      local.saveJournalEntries(current.filter((j) => j.date !== date));
    } else {
      const entry = journalFromRow(next);
      const existing = current.findIndex((j) => j.date === entry.date);
      const merged = existing === -1
        ? [entry, ...current]
        : current.map((j, i) => (i === existing ? entry : j));
      local.saveJournalEntries(merged);
    }
    emitRemoteChange();
  });

  // ---- profiles (KV, 1 row per user) ----
  channel.on("postgres_changes", { event: "*", schema: "public", table: "profiles", filter }, (payload) => {
    if (consumeIntent(`profile`)) return;
    const row = (payload.new ?? {}) as ProfileRow;

    if (row.life_config) local.saveLifeConfig(row.life_config);
    if (row.sound_settings) local.saveSoundSettings(row.sound_settings);
    if (row.timer_config) local.saveTimerConfig(row.timer_config);
    if (row.ambient_settings) local.saveAmbientSettings(row.ambient_settings);
    if (row.completion_sound) local.saveCompletionSound(row.completion_sound);
    if (row.daily_goal) local.saveDailyGoal(row.daily_goal);
    if (row.focus_tags) local.saveFocusTags(row.focus_tags);
    // Note: theme/locale handled separately by AppShell to avoid state flap
    emitRemoteChange();
  });

  channel.subscribe();

  return {
    channel,
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}
