"use client";

import { useState, useEffect, useRef } from "react";
import { type Locale, t, tFormat } from "@/lib/i18n";
import type { Goal, Milestone, Task, Priority } from "@/types";
import { PRIORITY_COLORS } from "@/types";
import { TargetIcon, CheckCircleIcon, CircleIcon, PenIcon, TrashIcon } from "@/components/shared/Icons";

interface GoalsTabProps {
  locale: Locale;
  milestones: Milestone[];
  onMilestonesChange: (milestones: Milestone[]) => void;
  tasks: Task[];
  onTaskAdd: (task: Task) => void;
  onTasksChange: (tasks: Task[]) => void;
}

export default function GoalsTab({ locale, milestones, onMilestonesChange, tasks, onTaskAdd, onTasksChange }: GoalsTabProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [addingMilestoneGoalId, setAddingMilestoneGoalId] = useState<string | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [deleteMilestoneId, setDeleteMilestoneId] = useState<string | null>(null);
  const [addingTaskFor, setAddingTaskFor] = useState<{ goalId: string; milestoneId?: string } | null>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null); // goalId
  const [aiResult, setAiResult] = useState<{ goalId: string; data: AIResult } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  interface AIResult {
    milestones: { title: string; dueDate: string; tasks: { title: string; priority: Priority }[] }[];
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("enso-goals");
      if (raw) {
        const parsed = JSON.parse(raw) as Goal[];
        setGoals(parsed.filter((g) => !g.achievedAt));
      }
    } catch { /* empty */ }
  }, []);

  const getDaysRemaining = (deadline: string): number => {
    const now = new Date();
    const end = new Date(deadline);
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleToggleMilestone = (id: string) => {
    onMilestonesChange(milestones.map((m) =>
      m.id === id ? { ...m, completed: !m.completed, completedAt: !m.completed ? new Date().toISOString() : undefined } : m
    ));
  };

  const handleAddMilestone = (goalId: string, title: string, dueDate: string) => {
    const goalMilestones = milestones.filter((m) => m.goalId === goalId);
    onMilestonesChange([...milestones, {
      id: crypto.randomUUID(), goalId, title, dueDate, completed: false, order: goalMilestones.length,
    }]);
    setAddingMilestoneGoalId(null);
  };

  const handleEditMilestone = (updated: Milestone) => {
    onMilestonesChange(milestones.map((m) => m.id === updated.id ? updated : m));
    setEditingMilestone(null);
  };

  const handleDeleteMilestone = (id: string) => {
    onMilestonesChange(milestones.filter((m) => m.id !== id));
    // 紐づくタスクも削除
    const next = tasks.filter((t) => t.milestoneId !== id);
    onTasksChange(next);
    setDeleteMilestoneId(null);
  };

  const handleQuickAddTask = (goalId: string, milestoneId: string | undefined, title: string, priority: Priority) => {
    const now = new Date().toISOString();
    const existingTasks = tasks.filter((t) => !t.completed);
    const maxOrder = Math.max(0, ...existingTasks.map((t) => t.order ?? 0));
    onTaskAdd({
      id: crypto.randomUUID(), title: title.trim(), priority, goalId, milestoneId,
      active: false, completed: false, order: maxOrder + 1, createdAt: now, updatedAt: now,
    });
    setAddingTaskFor(null);
  };

  const handleMoveToTasks = (taskIds: string[]) => {
    onTasksChange(tasks.map((t) =>
      taskIds.includes(t.id) ? { ...t, active: true, updatedAt: new Date().toISOString() } : t
    ));
  };

  const handleRemoveFromTasks = (taskId: string) => {
    onTasksChange(tasks.map((t) =>
      t.id === taskId ? { ...t, active: false, updatedAt: new Date().toISOString() } : t
    ));
  };

  // ===== AI生成 =====
  const handleAiGenerate = async (goal: Goal) => {
    setAiLoading(goal.id);
    setAiError(null);
    setAiResult(null);
    try {
      const res = await fetch("/api/task/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalTitle: goal.title, goalDeadline: goal.deadline.slice(0, 10), locale }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json() as AIResult;
      setAiResult({ goalId: goal.id, data });
    } catch {
      setAiError(goal.id);
    } finally {
      setAiLoading(null);
    }
  };

  const handleAiAccept = (goalId: string) => {
    if (!aiResult || aiResult.goalId !== goalId) return;
    const now = new Date().toISOString();
    const newMilestones: Milestone[] = [];
    const newTasks: Task[] = [];
    const existingMs = milestones.filter((m) => m.goalId === goalId);
    const existingTasks = tasks.filter((t) => !t.completed);
    let maxOrder = Math.max(0, ...existingTasks.map((t) => t.order ?? 0));

    aiResult.data.milestones.forEach((ms, msIdx) => {
      const msId = crypto.randomUUID();
      newMilestones.push({
        id: msId, goalId, title: ms.title, dueDate: ms.dueDate, completed: false, order: existingMs.length + msIdx,
      });
      ms.tasks.forEach((task) => {
        maxOrder++;
        newTasks.push({
          id: crypto.randomUUID(), title: task.title, priority: task.priority, goalId, milestoneId: msId,
          active: false, completed: false, order: maxOrder, createdAt: now, updatedAt: now,
        });
      });
    });

    onMilestonesChange([...milestones, ...newMilestones]);
    newTasks.forEach((t) => onTaskAdd(t));
    setAiResult(null);
  };

  return (
    <div className="animate-tab-enter space-y-5">
      <h2 className="text-lg font-bold">{t("goals.title", locale)}</h2>

      {goals.length === 0 ? (
        <div className="border-2 border-dashed border-card rounded-2xl p-8 text-center space-y-3">
          <TargetIcon size={28} className="mx-auto text-muted opacity-40 mb-2" />
          <p className="text-sm text-muted">{t("goals.noGoals", locale)}</p>
          <p className="text-xs text-muted opacity-50">{t("goals.noGoalsHint", locale)}</p>
          <a href="https://ensolife.app/timer" className="inline-block mt-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
            {t("goals.openTimer", locale)}
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const days = getDaysRemaining(goal.deadline);
            const isOverdue = days < 0;
            const goalMilestones = milestones.filter((m) => m.goalId === goal.id).sort((a, b) => a.order - b.order);
            const completedMs = goalMilestones.filter((m) => m.completed).length;
            const isExpanded = expandedGoalId === goal.id;
            const goalTasks = tasks.filter((t) => t.goalId === goal.id && !t.completed);
            const inactiveTasks = goalTasks.filter((t) => !t.active);

            return (
              <div key={goal.id} className="bg-card border border-card rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-3 cursor-pointer"
                  onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}>
                  <TargetIcon size={22} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{goal.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs ${isOverdue ? "text-red-400" : "text-muted"}`}>
                        {isOverdue ? t("goals.overdue", locale) : tFormat("goals.remaining", locale, days)}
                      </span>
                      {goalMilestones.length > 0 && <span className="text-xs text-emerald-500">{completedMs}/{goalMilestones.length}</span>}
                      {goalTasks.length > 0 && <span className="text-xs text-muted">{tFormat("goals.taskCount", locale, goalTasks.length)}</span>}
                    </div>
                    {goalMilestones.length > 0 && (
                      <div className="mt-2 h-1.5 rounded-full bg-subtle overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${(completedMs / goalMilestones.length) * 100}%` }} />
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted mt-1">{isExpanded ? "▲" : "▼"}</span>
                </div>

                {isExpanded && (
                  <div className="space-y-4 animate-fade-in">
                    {/* AI生成ボタン */}
                    <button onClick={() => handleAiGenerate(goal)}
                      disabled={aiLoading === goal.id}
                      className="w-full py-2 rounded-xl text-xs font-medium border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 disabled:opacity-50 transition-colors">
                      {aiLoading === goal.id ? t("goals.aiGenerating", locale) : t("goals.aiGenerate", locale)}
                    </button>

                    {/* AIエラー */}
                    {aiError === goal.id && (
                      <p className="text-xs text-red-400 text-center">{t("goals.aiError", locale)}</p>
                    )}

                    {/* AI結果プレビュー */}
                    {aiResult?.goalId === goal.id && (
                      <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-3 space-y-2">
                        <p className="text-xs font-bold text-purple-400">{t("goals.aiConfirm", locale)}</p>
                        {aiResult.data.milestones.map((ms, i) => (
                          <div key={i} className="space-y-1">
                            <p className="text-xs font-medium">◆ {ms.title} <span className="text-muted">({ms.dueDate.replace(/-/g, "/")})</span></p>
                            {ms.tasks.map((task, j) => (
                              <p key={j} className="text-[10px] text-muted pl-3">
                                • {task.title} <span className={PRIORITY_COLORS[task.priority]}>({t(`task.priority.${task.priority}`, locale)})</span>
                              </p>
                            ))}
                          </div>
                        ))}
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => setAiResult(null)}
                            className="flex-1 py-1.5 rounded-lg text-xs bg-subtle text-muted">{t("modal.cancel", locale)}</button>
                          <button onClick={() => handleAiAccept(goal.id)}
                            className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-purple-500 text-white">{t("goals.aiAdd", locale)}</button>
                        </div>
                      </div>
                    )}

                    {/* マイルストーン */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-muted">{t("goals.milestones", locale)}</h4>
                        <button onClick={() => setAddingMilestoneGoalId(goal.id)}
                          className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors">
                          {t("goals.addMilestone", locale)}
                        </button>
                      </div>

                      {goalMilestones.map((ms) => {
                        const msTasks = tasks.filter((t) => t.milestoneId === ms.id && !t.completed);
                        return (
                          <div key={ms.id} className="space-y-1.5">
                            <div className="flex items-center gap-2 pl-1">
                              <button onClick={() => handleToggleMilestone(ms.id)} className="shrink-0">
                                {ms.completed ? <CheckCircleIcon size={18} className="text-emerald-500" /> : <CircleIcon size={18} className="text-muted hover:text-emerald-500" />}
                              </button>
                              <p className={`text-sm flex-1 ${ms.completed ? "line-through text-muted" : ""}`}>{ms.title}</p>
                              <span className="text-[10px] text-muted tabular-nums">{ms.dueDate.replace(/-/g, "/")}</span>
                              {/* 編集・削除 */}
                              <button onClick={() => setEditingMilestone(ms)} className="text-muted hover:text-emerald-500 transition-colors"><PenIcon size={12} /></button>
                              <button onClick={() => setDeleteMilestoneId(ms.id)} className="text-muted hover:text-red-400 transition-colors"><TrashIcon size={12} /></button>
                              {!ms.completed && (
                                <button onClick={() => setAddingTaskFor({ goalId: goal.id, milestoneId: ms.id })}
                                  className="text-[10px] text-emerald-500 hover:text-emerald-400 transition-colors shrink-0">
                                  {t("goals.addTask", locale)}
                                </button>
                              )}
                            </div>
                            {msTasks.length > 0 && (
                              <div className="pl-8 space-y-1">
                                {msTasks.map((task) => (
                                  <GoalTaskRow key={task.id} task={task} locale={locale}
                                    onMoveToTasks={() => handleMoveToTasks([task.id])}
                                    onRemoveFromTasks={() => handleRemoveFromTasks(task.id)} />
                                ))}
                              </div>
                            )}
                            {addingTaskFor?.goalId === goal.id && addingTaskFor?.milestoneId === ms.id && (
                              <div className="pl-8">
                                <QuickAddTask locale={locale}
                                  onAdd={(title, priority) => handleQuickAddTask(goal.id, ms.id, title, priority)}
                                  onCancel={() => setAddingTaskFor(null)} />
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {addingMilestoneGoalId === goal.id && (
                        <AddMilestoneInline locale={locale} goalDeadline={goal.deadline}
                          onAdd={(title, dueDate) => handleAddMilestone(goal.id, title, dueDate)}
                          onCancel={() => setAddingMilestoneGoalId(null)} />
                      )}
                    </div>

                    {/* マイルストーンなしタスク */}
                    {(() => {
                      const noMsTasks = goalTasks.filter((t) => !t.milestoneId);
                      return noMsTasks.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold text-muted pl-1">{t("tasks.noMilestone", locale)}</p>
                          {noMsTasks.map((task) => (
                            <GoalTaskRow key={task.id} task={task} locale={locale}
                              onMoveToTasks={() => handleMoveToTasks([task.id])}
                              onRemoveFromTasks={() => handleRemoveFromTasks(task.id)} />
                          ))}
                        </div>
                      );
                    })()}

                    <button onClick={() => setAddingTaskFor({ goalId: goal.id, milestoneId: undefined })}
                      className="text-xs text-muted hover:text-emerald-500 transition-colors pl-1">
                      {t("goals.addTask", locale)} ({t("tasks.noMilestone", locale)})
                    </button>
                    {addingTaskFor?.goalId === goal.id && addingTaskFor?.milestoneId === undefined && (
                      <QuickAddTask locale={locale}
                        onAdd={(title, priority) => handleQuickAddTask(goal.id, undefined, title, priority)}
                        onCancel={() => setAddingTaskFor(null)} />
                    )}

                    {inactiveTasks.length > 0 && (
                      <button onClick={() => handleMoveToTasks(inactiveTasks.map((t) => t.id))}
                        className="w-full py-2 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors">
                        {t("goals.moveToTasks", locale)} ({inactiveTasks.length})
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-[10px] text-muted opacity-40">{t("goals.fromTimer", locale)}</p>

      {/* マイルストーン編集モーダル */}
      {editingMilestone && (
        <EditMilestoneModal locale={locale} milestone={editingMilestone}
          onSave={handleEditMilestone} onClose={() => setEditingMilestone(null)} />
      )}

      {/* マイルストーン削除確認 */}
      {deleteMilestoneId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in" onClick={() => setDeleteMilestoneId(null)}>
          <div className="w-full max-w-sm bg-modal rounded-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-center">{t("goals.deleteMilestoneConfirm", locale)}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteMilestoneId(null)} className="flex-1 py-2.5 rounded-xl text-sm bg-subtle text-muted hover:opacity-80">{t("modal.cancel", locale)}</button>
              <button onClick={() => handleDeleteMilestone(deleteMilestoneId)} className="flex-1 py-2.5 rounded-xl text-sm text-red-400 bg-subtle hover:opacity-80">{t("modal.delete", locale)}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== 目標タスク行 =====
function GoalTaskRow({ task, locale, onMoveToTasks, onRemoveFromTasks }: {
  task: Task; locale: Locale; onMoveToTasks: () => void; onRemoveFromTasks: () => void;
}) {
  const isActive = task.active === true;
  return (
    <div className="flex items-center gap-2 py-1">
      <span className={`text-[10px] font-medium ${PRIORITY_COLORS[task.priority]}`}>
        {task.priority === "high" ? "!" : task.priority === "medium" ? "-" : "·"}
      </span>
      <span className="text-xs flex-1 truncate">{task.title}</span>
      {isActive ? (
        <button onClick={onRemoveFromTasks}
          className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors shrink-0">
          {t("goals.inTasks", locale)}
        </button>
      ) : (
        <button onClick={onMoveToTasks}
          className="text-[10px] px-2 py-0.5 rounded-full bg-subtle text-muted hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors shrink-0">
          {t("goals.moveToTasks", locale)}
        </button>
      )}
    </div>
  );
}

// ===== クイックタスク追加（優先度付き） =====
function QuickAddTask({ locale, onAdd, onCancel }: {
  locale: Locale; onAdd: (title: string, priority: Priority) => void; onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [composing, setComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  const priorities: Priority[] = ["high", "medium", "low"];

  return (
    <div className="bg-subtle rounded-xl px-3 py-2 space-y-2">
      <input ref={inputRef} type="text" value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("task.title.placeholder", locale)}
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={() => setComposing(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !composing && title.trim()) onAdd(title.trim(), priority);
          if (e.key === "Escape") onCancel();
        }}
        className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted"
        style={{ color: "var(--text)" }} />
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {priorities.map((p) => (
            <button key={p} onClick={() => setPriority(p)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                priority === p ? PRIORITY_COLORS[p] + " bg-white/5" : "text-muted"}`}>
              {t(`task.priority.${p}`, locale)}
            </button>
          ))}
        </div>
        <button onClick={onCancel} className="text-xs text-muted hover:opacity-80">{t("modal.cancel", locale)}</button>
        <button onClick={() => title.trim() && onAdd(title.trim(), priority)}
          disabled={!title.trim()} className="text-xs text-emerald-500 font-medium disabled:opacity-30">
          {t("task.save", locale)}
        </button>
      </div>
    </div>
  );
}

// ===== マイルストーン編集モーダル =====
function EditMilestoneModal({ locale, milestone, onSave, onClose }: {
  locale: Locale; milestone: Milestone; onSave: (ms: Milestone) => void; onClose: () => void;
}) {
  const [title, setTitle] = useState(milestone.title);
  const [dueDate, setDueDate] = useState(milestone.dueDate);
  const [composing, setComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 300); }, []);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ ...milestone, title: title.trim(), dueDate });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-sm bg-modal rounded-2xl p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-bold text-center">{t("goals.editMilestone", locale)}</h3>
        <div>
          <label className="text-xs text-muted block mb-1">{t("task.title", locale)}</label>
          <input ref={inputRef} type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={() => setComposing(false)}
            onKeyDown={(e) => { if (e.key === "Enter" && !composing) handleSave(); }}
            className="w-full bg-input border border-input rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text)" }} />
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
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-30 transition-colors">
            {t("task.update", locale)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== マイルストーン追加（インライン） =====
function AddMilestoneInline({ locale, goalDeadline, onAdd, onCancel }: {
  locale: Locale; goalDeadline: string; onAdd: (title: string, dueDate: string) => void; onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [composing, setComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  const handleSave = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), dueDate || goalDeadline.slice(0, 10));
  };

  return (
    <div className="bg-subtle rounded-xl p-3 space-y-2">
      <input ref={inputRef} type="text" value={title} onChange={(e) => setTitle(e.target.value)}
        placeholder={t("goals.milestone.placeholder", locale)}
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={() => setComposing(false)}
        onKeyDown={(e) => { if (e.key === "Enter" && !composing) handleSave(); if (e.key === "Escape") onCancel(); }}
        className="w-full bg-transparent text-sm py-1 border-b border-card focus:border-emerald-500/50 focus:outline-none placeholder:text-muted"
        style={{ color: "var(--text)" }} />
      <div className="flex items-center gap-2">
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
          className="flex-1 bg-transparent text-xs py-1 text-muted focus:outline-none appearance-none" style={{ color: "var(--muted)" }} />
        <button onClick={onCancel} className="text-xs text-muted hover:opacity-80">{t("modal.cancel", locale)}</button>
        <button onClick={handleSave} disabled={!title.trim()} className="text-xs text-emerald-500 font-medium disabled:opacity-30">{t("task.save", locale)}</button>
      </div>
    </div>
  );
}
