"use client";

import { useState } from "react";
import { Goal } from "@/types";
import { t } from "@/lib/i18n";
import { CheckCircleIcon } from "@/components/shared/Icons";

interface Props {
  goal: Goal;
  onUnachieve: (id: string) => void;
}

export default function AchievedGoalCard({ goal, onUnachieve }: Props) {
  const [showMenu, setShowMenu] = useState(false);

  const achievedDate = goal.achievedAt
    ? new Date(goal.achievedAt).toLocaleDateString()
    : "";

  return (
    <div className="bg-card backdrop-blur-sm rounded-2xl p-4 border border-emerald-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircleIcon size={22} className="text-emerald-500 shrink-0" />
          <div>
            <h2 className="text-lg font-bold">{goal.title}</h2>
            <p className="text-xs text-emerald-500/60 mt-1">
              {t("goals.achievedDate")}: {achievedDate}
            </p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-muted hover:opacity-80 text-sm transition-opacity px-2"
          >
            ⋯
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 bg-modal rounded-lg shadow-xl border border-card z-20 overflow-hidden">
                <button
                  onClick={() => { onUnachieve(goal.id); setShowMenu(false); }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-subtle transition-colors whitespace-nowrap"
                >
                  {t("goals.restore")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <p className="text-xs text-muted mt-2">
        {t("goals.deadline")}: {new Date(goal.deadline).toLocaleString()}
      </p>
      {goal.memo && (
        <p className="text-xs text-muted mt-1 italic">&ldquo;{goal.memo}&rdquo;</p>
      )}
    </div>
  );
}
