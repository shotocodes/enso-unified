"use client";

import { useState, useEffect } from "react";
import { Goal, TimeUnit } from "@/types";
import { t } from "@/lib/i18n";
import { calcTimeRemaining, formatRelativeDate } from "@/lib/time";
import CountdownDisplay from "./CountdownDisplay";
import TimeUnitSelector from "./TimeUnitSelector";
import { TargetIcon, BellIcon } from "@/components/shared/Icons";

interface Props {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onAchieve?: (id: string) => void;
  isJustCompleted?: boolean;
}

export default function GoalCountdown({ goal, onEdit, onDelete, onAchieve, isJustCompleted }: Props) {
  const [unit, setUnit] = useState<TimeUnit>("days");
  const [time, setTime] = useState(() => calcTimeRemaining(goal.deadline));
  const [showMenu, setShowMenu] = useState(false);
  const [showTaskConfirm, setShowTaskConfirm] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(calcTimeRemaining(goal.deadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [goal.deadline]);

  return (
    <div className={`bg-card backdrop-blur-sm rounded-2xl p-4 border ${isJustCompleted ? "border-amber-500/50 animate-pulse-glow" : "border-card"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TargetIcon size={22} className="text-muted shrink-0" />
          <h2 className="text-lg font-bold">{goal.title}</h2>
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
              <div className="absolute right-0 top-8 bg-modal rounded-lg shadow-xl border border-card z-20 overflow-hidden flex">
                {onAchieve && (
                  <button
                    onClick={() => { onAchieve(goal.id); setShowMenu(false); }}
                    className="px-4 py-2 text-xs font-medium text-emerald-500 hover:bg-subtle transition-colors whitespace-nowrap"
                  >
                    {t("goals.achieve")}
                  </button>
                )}
                <button
                  onClick={() => { onEdit(goal); setShowMenu(false); }}
                  className="px-4 py-2 text-xs font-medium hover:bg-subtle transition-colors whitespace-nowrap border-l border-card"
                >
                  {t("goals.edit")}
                </button>
                <button
                  onClick={() => { onDelete(goal.id); setShowMenu(false); }}
                  className="px-4 py-2 text-xs font-medium text-red-400 hover:bg-subtle transition-colors whitespace-nowrap border-l border-card"
                >
                  {t("goals.delete")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {isJustCompleted && (
        <div className="text-xs text-amber-400 font-bold mb-2 flex items-center gap-1">
          <BellIcon size={14} /> {t("goals.timeUp")}
        </div>
      )}

      <div className="text-xs text-muted mb-3">
        {t("goals.deadline")}: {formatRelativeDate(goal.deadline)}
      </div>

      <div className="mb-3">
        <CountdownDisplay time={time} unit={unit} />
      </div>

      <TimeUnitSelector value={unit} onChange={setUnit} />

      {/* TASK連携ボタン */}
      <button
        onClick={() => setShowTaskConfirm(true)}
        className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-card border border-card text-xs font-medium text-muted hover:text-emerald-500 hover:border-emerald-500/20 transition-all"
      >
        <svg width={14} height={14} viewBox="0 0 100 100" fill="none" className="text-emerald-500">
          <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.9" />
          <polyline points="40,50 48,58 62,42" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t("goals.openTask")}
      </button>

      {/* TASK確認ポップアップ */}
      {showTaskConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowTaskConfirm(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 px-6">
            <div className="bg-modal rounded-2xl p-6 w-full max-w-xs border border-card animate-fade-in">
              <p className="text-sm font-medium text-center mb-1">{t("goals.taskConfirm")}</p>
              <p className="text-xs text-muted text-center mb-5">{t("goals.taskConfirmDesc")}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTaskConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-subtle text-muted hover:opacity-80 transition-colors"
                >
                  {t("goals.cancel")}
                </button>
                <a
                  href="https://ensolife.app/task"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-white text-center hover:bg-emerald-600 transition-colors"
                >
                  {t("goals.goToTask")}
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
