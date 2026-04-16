"use client";

import { useState, useEffect, useCallback } from "react";
import { t } from "@/lib/i18n";
import {
  getTasks, saveTasks,
  getMilestones, saveMilestones,
  getGoals,
} from "@/lib/storage";
import type { Task, Milestone, Goal } from "@/types";
import { useAppShell } from "@/components/shared/AppShell";
import PageHeader from "@/components/shared/PageHeader";
import TasksTab from "@/components/task/tabs/TasksTab";
import GoalsTab from "@/components/task/tabs/GoalsTab";

type TabId = "tasks" | "goals";

export default function TaskPage() {
  const { locale, mounted } = useAppShell();
  const [activeTab, setActiveTab] = useState<TabId>("tasks");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  // Initial + cross-tab refresh
  const reload = useCallback(() => {
    setTasks(getTasks());
    setMilestones(getMilestones());
    setGoals(getGoals());
  }, []);

  useEffect(() => {
    reload();
    const onVisibility = () => {
      if (document.visibilityState === "visible") reload();
    };
    window.addEventListener("focus", reload);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", reload);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reload]);

  // Refresh goals when switching to goals tab
  useEffect(() => {
    if (activeTab === "goals") setGoals(getGoals());
  }, [activeTab]);

  const handleTasksChange = useCallback((next: Task[]) => {
    setTasks(next);
    saveTasks(next);
  }, []);

  const handleTaskAdd = useCallback((task: Task) => {
    setTasks((prev) => {
      const next = [task, ...prev];
      saveTasks(next);
      return next;
    });
  }, []);

  const handleMilestonesChange = useCallback((next: Milestone[]) => {
    setMilestones(next);
    saveMilestones(next);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <PageHeader title={t("task.name", locale)} subtitle={t("task.tagline", locale)} />

      {/* Local tab switcher (Tasks / Goals) */}
      <div className="flex gap-2 mb-5 bg-card border border-card rounded-xl p-1">
        {(["tasks", "goals"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === tab
                ? "bg-emerald-500/15 text-emerald-500"
                : "text-muted hover:opacity-80"
            }`}
          >
            {t(`tabs.${tab}`, locale)}
          </button>
        ))}
      </div>

      <div key={`${activeTab}-${locale}`}>
        {activeTab === "tasks" && (
          <TasksTab
            locale={locale}
            tasks={tasks}
            milestones={milestones}
            goals={goals}
            onTasksChange={handleTasksChange}
          />
        )}
        {activeTab === "goals" && (
          <GoalsTab
            locale={locale}
            milestones={milestones}
            onMilestonesChange={handleMilestonesChange}
            tasks={tasks}
            onTaskAdd={handleTaskAdd}
            onTasksChange={handleTasksChange}
          />
        )}
      </div>
    </main>
  );
}
