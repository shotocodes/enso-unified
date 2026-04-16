"use client";

import { useState, useEffect } from "react";
import { Goal } from "@/types";
import { t } from "@/lib/i18n";
import GoalCountdown from "@/components/timer/GoalCountdown";
import AchievedGoalCard from "@/components/timer/AchievedGoalCard";

interface Props {
  activeGoals: Goal[];
  achievedGoals: Goal[];
  completedGoalIds: Set<string>;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
  onAchieveGoal: (id: string) => void;
  onUnachieveGoal: (id: string) => void;
  onAddGoal: () => void;
  autoShowAchieved?: boolean;
}

export default function GoalsTab({
  activeGoals,
  achievedGoals,
  completedGoalIds,
  onEditGoal,
  onDeleteGoal,
  onAchieveGoal,
  onUnachieveGoal,
  onAddGoal,
  autoShowAchieved,
}: Props) {
  const [showAchieved, setShowAchieved] = useState(false);

  useEffect(() => {
    if (autoShowAchieved) setShowAchieved(true);
  }, [autoShowAchieved]);

  return (
    <div className="animate-tab-enter">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowAchieved(false)}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
            !showAchieved ? "bg-card border border-card text-emerald-500" : "text-muted"
          }`}
        >
          {t("tabs.goals")} ({activeGoals.length})
        </button>
        <button
          onClick={() => setShowAchieved(true)}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
            showAchieved ? "bg-emerald-500/20 text-emerald-500" : "text-muted"
          }`}
        >
          {t("goals.achieved")} ({achievedGoals.length})
        </button>
      </div>

      <div className="space-y-5">
        {!showAchieved ? (
          <>
            {activeGoals.length > 0 ? (
              activeGoals.map((goal) => (
                <GoalCountdown
                  key={goal.id}
                  goal={goal}
                  onEdit={onEditGoal}
                  onDelete={onDeleteGoal}
                  onAchieve={onAchieveGoal}
                  isJustCompleted={completedGoalIds.has(goal.id)}
                />
              ))
            ) : (
              <div className="text-center py-8 px-4">
                <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" className="mx-auto mb-3 text-muted opacity-50">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-sm font-medium text-muted">{t("goals.emptyActive")}</p>
                <p className="text-xs text-muted opacity-60 mt-1">{t("goals.emptyActiveHint")}</p>
              </div>
            )}
            <button
              onClick={onAddGoal}
              className="w-full py-4 rounded-2xl border border-dashed border-card text-muted hover:opacity-80 transition-opacity text-sm"
            >
              {t("goals.add")}
            </button>
          </>
        ) : (
          <>
            {achievedGoals.length === 0 ? (
              <div className="text-center py-12 text-muted text-sm">
                {t("goals.empty")}
              </div>
            ) : (
              achievedGoals.map((goal) => (
                <AchievedGoalCard
                  key={goal.id}
                  goal={goal}
                  onUnachieve={onUnachieveGoal}
                />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
