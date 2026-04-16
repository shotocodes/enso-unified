"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { type Locale, t, tFormat } from "@/lib/i18n";
import type { Task, Priority, Goal, Milestone } from "@/types";
import { PRIORITY_COLORS, PRIORITY_BG } from "@/types";
import { recordTaskToJournal } from "@/lib/storage";
import { TrashIcon, PenIcon, CheckCircleIcon, CircleIcon, ChecklistIcon, TargetIcon } from "@/components/shared/Icons";

interface TasksTabProps {
  locale: Locale;
  tasks: Task[];
  milestones: Milestone[];
  goals: Goal[];
  onTasksChange: (tasks: Task[]) => void;
}

// activeなタスクかどうか判定（goalIdなし=常にactive、goalIdあり=active===trueのみ）
function isActiveTask(task: Task): boolean {
  if (!task.goalId) return true;
  return task.active === true;
}

export default function TasksTab({ locale, tasks, milestones, goals, onTasksChange }: TasksTabProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [collapsedGoals, setCollapsedGoals] = useState<Set<string>>(new Set());

  // activeタスクのみ表示
  const activeTasks = useMemo(() =>
    tasks.filter((t) => !t.completed && isActiveTask(t)).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [tasks]
  );
  const completedTasks = useMemo(() =>
    tasks.filter((t) => t.completed && isActiveTask(t)),
    [tasks]
  );
  const completedCount = completedTasks.length;
  const totalCount = activeTasks.length + completedCount;

  // --- 目標別グルーピング（activeタスクのみ） ---
  const grouped = useMemo(() => {
    const goalTasks = new Map<string, Task[]>();
    const uncategorized: Task[] = [];

    for (const task of activeTasks) {
      if (task.goalId) {
        if (!goalTasks.has(task.goalId)) goalTasks.set(task.goalId, []);
        goalTasks.get(task.goalId)!.push(task);
      } else {
        uncategorized.push(task);
      }
    }

    const goalGroups = Array.from(goalTasks.entries()).map(([goalId, tasks]) => ({
      goal: goals.find((g) => g.id === goalId),
      tasks,
    }));

    return { goalGroups, uncategorized };
  }, [activeTasks, goals]);

  const toggleGoal = (id: string) => {
    setCollapsedGoals((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleToggle = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    const isCompleting = task && !task.completed;
    const next = tasks.map((t) =>
      t.id === id
        ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined, updatedAt: new Date().toISOString() }
        : t
    );
    onTasksChange(next);
    if (isCompleting && task) recordTaskToJournal(task.title);
  };

  const handleAdd = (task: Task) => {
    const maxOrder = Math.max(0, ...activeTasks.map((t) => t.order ?? 0));
    onTasksChange([{ ...task, order: maxOrder + 1 }, ...tasks]);
    setShowAdd(false);
  };

  const handleEdit = (updated: Task) => {
    onTasksChange(tasks.map((t) => (t.id === updated.id ? updated : t)));
    setEditTask(null);
  };

  const handleMoveUp = (id: string, list: Task[]) => {
    const idx = list.findIndex((t) => t.id === id);
    if (idx <= 0) return;
    const above = list[idx - 1];
    const current = list[idx];
    const next = tasks.map((t) => {
      if (t.id === current.id) return { ...t, order: above.order ?? 0 };
      if (t.id === above.id) return { ...t, order: current.order ?? 0 };
      return t;
    });
    onTasksChange(next);
  };

  const handleMoveDown = (id: string, list: Task[]) => {
    const idx = list.findIndex((t) => t.id === id);
    if (idx < 0 || idx >= list.length - 1) return;
    const below = list[idx + 1];
    const current = list[idx];
    const next = tasks.map((t) => {
      if (t.id === current.id) return { ...t, order: below.order ?? 0 };
      if (t.id === below.id) return { ...t, order: current.order ?? 0 };
      return t;
    });
    onTasksChange(next);
  };

  const handleDelete = (id: string) => {
    onTasksChange(tasks.filter((t) => t.id !== id));
    setDeleteId(null);
  };

  const hasGoalGroups = grouped.goalGroups.length > 0;

  const renderTaskList = (list: Task[]) => (
    <div className="space-y-2">
      {list.map((task, idx) => (
        <TaskCard key={task.id} task={task} locale={locale}
          onToggle={handleToggle} onEdit={setEditTask} onDelete={setDeleteId} onFocus={setFocusTask}
          onMoveUp={idx > 0 ? () => handleMoveUp(task.id, list) : undefined}
          onMoveDown={idx < list.length - 1 ? () => handleMoveDown(task.id, list) : undefined} />
      ))}
    </div>
  );

  return (
    <div className="animate-tab-enter space-y-5">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{t("tasks.title", locale)}</h2>
        <button onClick={() => setShowAdd(true)} className="text-xs font-medium text-emerald-500 hover:text-emerald-400 transition-colors">
          {t("tasks.add", locale)}
        </button>
      </div>

      {/* 進捗 */}
      {totalCount > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-subtle overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }} />
          </div>
          <span className="text-xs text-muted tabular-nums">{tFormat("tasks.count", locale, completedCount, totalCount)}</span>
        </div>
      )}

      {/* 目標別グループ */}
      {hasGoalGroups && grouped.goalGroups.map(({ goal, tasks: goalTasks }) => {
        const goalId = goal?.id ?? "unknown";
        const isCollapsed = collapsedGoals.has(goalId);
        return (
          <div key={goalId} className="space-y-2">
            <button onClick={() => toggleGoal(goalId)} className="flex items-center gap-2 w-full text-left">
              <TargetIcon size={16} className="text-emerald-500 shrink-0" />
              <span className="text-xs font-bold flex-1 truncate">{goal?.title ?? goalId}</span>
              <span className="text-[10px] text-muted tabular-nums">{goalTasks.length}</span>
              <span className="text-[10px] text-muted">{isCollapsed ? "▼" : "▲"}</span>
            </button>
            {!isCollapsed && renderTaskList(goalTasks)}
          </div>
        );
      })}

      {/* 未分類タスク */}
      {grouped.uncategorized.length > 0 && (
        <div className="space-y-2">
          {hasGoalGroups && <p className="text-xs font-bold text-muted">{t("tasks.uncategorized", locale)}</p>}
          {renderTaskList(grouped.uncategorized)}
        </div>
      )}

      {activeTasks.length > 5 && (
        <p className="text-center text-[10px] text-muted opacity-40">TOP 5 → ENSO FOCUS</p>
      )}

      {/* 空状態 */}
      {activeTasks.length === 0 && completedTasks.length === 0 && (
        <div className="border-2 border-dashed border-card rounded-2xl p-8 text-center">
          <ChecklistIcon size={28} className="mx-auto text-muted opacity-40 mb-2" />
          <p className="text-sm text-muted">{t("tasks.empty", locale)}</p>
          <p className="text-xs text-muted mt-1 opacity-50">{t("tasks.emptyHint", locale)}</p>
        </div>
      )}

      {/* 完了済み */}
      {completedTasks.length > 0 && (
        <div>
          <button onClick={() => setShowCompleted(!showCompleted)}
            className="text-sm font-bold text-muted hover:text-emerald-500 transition-colors">
            {t("tasks.completed", locale)} ({completedTasks.length}) {showCompleted ? "▲" : "▼"}
          </button>
          {showCompleted && (
            <div className="space-y-2 mt-3 animate-fade-in">
              {completedTasks.sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? "")).map((task) => (
                <TaskCard key={task.id} task={task} locale={locale} onToggle={handleToggle} onEdit={setEditTask} onDelete={setDeleteId} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* タスク追加/編集モーダル */}
      {showAdd && <TaskModal locale={locale} goals={goals} milestones={milestones} onSave={handleAdd} onClose={() => setShowAdd(false)} />}
      {editTask && <TaskModal locale={locale} goals={goals} milestones={milestones} initial={editTask} onSave={handleEdit} onClose={() => setEditTask(null)} />}

      {/* 削除確認 */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in" onClick={() => setDeleteId(null)}>
          <div className="w-full max-w-sm bg-modal rounded-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-center">{t("modal.confirm", locale)}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl text-sm bg-subtle text-muted hover:opacity-80">{t("modal.cancel", locale)}</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl text-sm text-red-400 bg-subtle hover:opacity-80">{t("modal.delete", locale)}</button>
            </div>
          </div>
        </div>
      )}

      {/* FOCUS集中ポップアップ */}
      {focusTask && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in" onClick={() => setFocusTask(null)}>
          <div className="w-full max-w-sm bg-modal rounded-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-center">{tFormat("tasks.focusPrompt", locale, focusTask.title)}</p>
            <div className="flex gap-3">
              <button onClick={() => setFocusTask(null)} className="flex-1 py-2.5 rounded-xl text-sm bg-subtle text-muted hover:opacity-80">{t("tasks.close", locale)}</button>
              <a href={`https://ensolife.app/focus?taskId=${focusTask.id}`}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-center">
                {t("tasks.openFocus", locale)}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== タスクカード =====
function TaskCard({
  task, locale, onToggle, onEdit, onDelete, onFocus, onMoveUp, onMoveDown,
}: {
  task: Task; locale: Locale;
  onToggle: (id: string) => void; onEdit: (task: Task) => void; onDelete: (id: string) => void;
  onFocus?: (task: Task) => void; onMoveUp?: () => void; onMoveDown?: () => void;
}) {
  return (
    <div className={`bg-card border border-card rounded-xl p-3 flex items-center gap-2 ${task.completed ? "opacity-50" : ""}`}>
      {!task.completed && (
        <div className="flex flex-col shrink-0">
          <button onClick={onMoveUp} disabled={!onMoveUp}
            className={`text-[10px] leading-none p-0.5 ${onMoveUp ? "text-muted hover:text-emerald-500" : "text-transparent"} transition-colors`}>▲</button>
          <button onClick={onMoveDown} disabled={!onMoveDown}
            className={`text-[10px] leading-none p-0.5 ${onMoveDown ? "text-muted hover:text-emerald-500" : "text-transparent"} transition-colors`}>▼</button>
        </div>
      )}
      <button onClick={() => onToggle(task.id)} className="shrink-0 transition-colors">
        {task.completed ? <CheckCircleIcon size={22} className="text-emerald-500" /> : <CircleIcon size={22} className="text-muted hover:text-emerald-500" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${task.completed ? "line-through text-muted" : ""}`}>{task.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] font-medium ${PRIORITY_COLORS[task.priority]}`}>{t(`task.priority.${task.priority}`, locale)}</span>
          {task.dueDate && <span className="text-[10px] text-muted tabular-nums">{task.dueDate.slice(5)}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {!task.completed && onFocus && (
          <button onClick={() => onFocus(task)} className="text-emerald-500/40 hover:text-emerald-500 transition-colors" title={t("tasks.openFocus", locale)}>
            <svg width={16} height={16} viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.9" />
              <circle cx="50" cy="50" r="5" fill="currentColor" />
            </svg>
          </button>
        )}
        <button onClick={() => onEdit(task)} className="text-muted hover:text-emerald-500 transition-colors"><PenIcon size={14} /></button>
        <button onClick={() => onDelete(task.id)} className="text-muted hover:text-red-400 transition-colors"><TrashIcon size={14} /></button>
      </div>
    </div>
  );
}

// ===== タスク追加/編集モーダル（タスクタブからの追加はactive=true） =====
function TaskModal({
  locale, goals, milestones, initial, onSave, onClose,
}: {
  locale: Locale; goals: Goal[]; milestones: Milestone[];
  initial?: Task; onSave: (task: Task) => void; onClose: () => void;
}) {
  const isEdit = !!initial;
  const [title, setTitle] = useState(initial?.title ?? "");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [composing, setComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 300); }, []);

  const handleSave = () => {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      title: title.trim(),
      priority,
      dueDate: dueDate || undefined,
      goalId: initial?.goalId,
      milestoneId: initial?.milestoneId,
      active: initial?.active ?? true, // タスクタブから追加 = 常にactive
      completed: initial?.completed ?? false,
      completedAt: initial?.completedAt,
      order: initial?.order ?? Date.now(),
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    });
  };

  const priorities: Priority[] = ["high", "medium", "low"];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-sm bg-modal rounded-2xl p-5 space-y-3 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-bold text-center">{t(isEdit ? "task.edit.title" : "task.add.title", locale)}</h3>

        <div>
          <label className="text-xs text-muted block mb-1">{t("task.title", locale)}</label>
          <input ref={inputRef} type="text" value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("task.title.placeholder", locale)}
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={() => setComposing(false)}
            onKeyDown={(e) => { if (e.key === "Enter" && !composing) handleSave(); }}
            className="w-full bg-input border border-input rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder:text-muted"
            style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text)" }} />
        </div>

        <div>
          <label className="text-xs text-muted block mb-1">{t("task.priority", locale)}</label>
          <div className="flex gap-2">
            {priorities.map((p) => (
              <button key={p} onClick={() => setPriority(p)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                  priority === p ? PRIORITY_BG[p] + " " + PRIORITY_COLORS[p] : "bg-subtle text-muted border-transparent"}`}>
                {t(`task.priority.${p}`, locale)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-muted block mb-1">{t("task.dueDate", locale)}</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-input border border-input rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
            style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text)" }} />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm bg-subtle text-muted hover:opacity-80">{t("modal.cancel", locale)}</button>
          <button onClick={handleSave} disabled={!title.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            {t(isEdit ? "task.update" : "task.save", locale)}
          </button>
        </div>
      </div>
    </div>
  );
}
