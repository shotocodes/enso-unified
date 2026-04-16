"use client";

import { useState, useEffect, useCallback } from "react";
import type { Goal, LifeConfig, NotifyTiming, SoundSettings } from "@/types";
import { t } from "@/lib/i18n";
import {
  getLifeConfig, saveLifeConfig,
  addGoal, updateGoal, deleteGoal,
  achieveGoal, unachieveGoal,
  getActiveGoalsList, getAchievedGoals,
  getSoundSettings, saveSoundSettings,
} from "@/lib/storage";
import { useAppShell } from "@/components/shared/AppShell";
import PageHeader from "@/components/shared/PageHeader";
import GoalModal from "@/components/timer/GoalModal";
import LifeConfigModal from "@/components/timer/LifeConfigModal";
import AchievementPopup from "@/components/timer/AchievementPopup";
import LifeTab from "@/components/timer/tabs/LifeTab";
import GoalsTab from "@/components/timer/tabs/GoalsTab";
import { useTickingSound } from "@/hooks/useTickingSound";
import { useGoalNotifications } from "@/hooks/useGoalNotifications";

type TabId = "life" | "goals";

export default function TimerPage() {
  const { locale, mounted: shellMounted } = useAppShell();

  const [lifeConfig, setLifeConfig] = useState<LifeConfig | null>(null);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [achievedGoals, setAchievedGoals] = useState<Goal[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("life");

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showLifeModal, setShowLifeModal] = useState(false);
  const [achievementPopup, setAchievementPopup] = useState<Goal | null>(null);
  const [achieveToast, setAchieveToast] = useState<string | null>(null);

  const [soundSettings, setSoundSettings] = useState<SoundSettings>({
    enabled: false, tickSound: "classic", volume: 0.5,
  });

  useTickingSound(soundSettings);
  const { completedGoalIds } = useGoalNotifications(activeGoals);

  const refreshGoals = useCallback(() => {
    setActiveGoals(getActiveGoalsList());
    setAchievedGoals(getAchievedGoals());
  }, []);

  // Initial load
  useEffect(() => {
    setLifeConfig(getLifeConfig());
    setSoundSettings(getSoundSettings());
    refreshGoals();
  }, [refreshGoals]);

  // Refresh when returning from another page/tab
  useEffect(() => {
    const reload = () => {
      setLifeConfig(getLifeConfig());
      refreshGoals();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") reload();
    };
    window.addEventListener("focus", reload);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", reload);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refreshGoals]);

  const handleSaveLife = useCallback((config: LifeConfig) => {
    saveLifeConfig(config);
    setLifeConfig(config);
    setShowLifeModal(false);
  }, []);

  const handleSaveGoal = useCallback(
    (data: { title: string; deadline: string; notifyTimings: NotifyTiming[] }) => {
      if (editingGoal) {
        updateGoal(editingGoal.id, data);
      } else {
        addGoal(data);
      }
      refreshGoals();
      setShowGoalModal(false);
      setEditingGoal(null);
    },
    [editingGoal, refreshGoals]
  );

  const handleEditGoal = useCallback((goal: Goal) => {
    setEditingGoal(goal);
    setShowGoalModal(true);
  }, []);

  const handleDeleteGoal = useCallback((id: string) => {
    deleteGoal(id);
    refreshGoals();
  }, [refreshGoals]);

  const handleAchieveGoal = useCallback((id: string) => {
    const goal = activeGoals.find((g) => g.id === id);
    if (goal) setAchievementPopup(goal);
  }, [activeGoals]);

  const handleConfirmAchievement = useCallback((memo?: string) => {
    if (!achievementPopup) return;
    achieveGoal(achievementPopup.id, memo);
    const goalTitle = achievementPopup.title;
    refreshGoals();
    setAchievementPopup(null);
    setAchieveToast(goalTitle);
    setTimeout(() => setAchieveToast(null), 3000);
  }, [achievementPopup, refreshGoals]);

  const handleUnachieveGoal = useCallback((id: string) => {
    unachieveGoal(id);
    refreshGoals();
  }, [refreshGoals]);

  const handleSoundSettingsChange = useCallback((s: SoundSettings) => {
    setSoundSettings(s);
    saveSoundSettings(s);
  }, []);

  // Suppress unused-warning while still exposing for sub-components needing it
  void handleSoundSettingsChange;

  if (!shellMounted) return null;

  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <PageHeader title={t("timer.name", locale)} subtitle={t("timer.tagline", locale)} />

      {/* Local tab switcher (Life / Goals) */}
      <div className="flex gap-2 mb-5 bg-card border border-card rounded-xl p-1">
        {(["life", "goals"] as const).map((tab) => (
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

      {/* Tab content */}
      {activeTab === "life" && (
        <LifeTab key={locale} lifeConfig={lifeConfig} onEditLife={() => setShowLifeModal(true)} />
      )}
      {activeTab === "goals" && (
        <GoalsTab
          key={locale}
          activeGoals={activeGoals}
          achievedGoals={achievedGoals}
          completedGoalIds={completedGoalIds}
          onEditGoal={handleEditGoal}
          onDeleteGoal={handleDeleteGoal}
          onAchieveGoal={handleAchieveGoal}
          onUnachieveGoal={handleUnachieveGoal}
          onAddGoal={() => { setEditingGoal(null); setShowGoalModal(true); }}
          autoShowAchieved={!!achieveToast}
        />
      )}

      <GoalModal
        key={`goal-${locale}`}
        open={showGoalModal}
        onClose={() => { setShowGoalModal(false); setEditingGoal(null); }}
        onSave={handleSaveGoal}
        editGoal={editingGoal}
      />
      <LifeConfigModal
        key={`life-${locale}`}
        open={showLifeModal}
        onClose={() => setShowLifeModal(false)}
        onSave={handleSaveLife}
        config={lifeConfig}
      />

      {/* Achievement Toast */}
      {achieveToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-emerald-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20,6 9,17 4,12" />
            </svg>
            {t("goals.achieveToast", locale)}
          </div>
        </div>
      )}

      {achievementPopup && (
        <AchievementPopup
          goal={achievementPopup}
          onConfirm={handleConfirmAchievement}
          onClose={() => setAchievementPopup(null)}
        />
      )}
    </main>
  );
}
