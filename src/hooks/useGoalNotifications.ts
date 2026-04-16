"use client";

import { useEffect, useRef, useState } from "react";
import { Goal, NotifyTiming, NOTIFY_TIMING_I18N_KEYS, NOTIFY_TIMING_MS } from "@/types";
import { t } from "@/lib/i18n";
import { getNotifiedKeys, addNotifiedKey } from "@/lib/storage";
import { playAlert } from "@/lib/sound";

export function useGoalNotifications(activeGoals: Goal[]) {
  const [completedGoalIds, setCompletedGoalIds] = useState<Set<string>>(new Set());
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    notifiedRef.current = getNotifiedKeys();
  }, []);

  useEffect(() => {
    const check = () => {
      const newCompleted = new Set(completedGoalIds);
      let changed = false;

      for (const goal of activeGoals) {
        const timings: NotifyTiming[] = goal.notifyTimings ?? ["0"];
        const deadlineMs = new Date(goal.deadline).getTime();
        const now = Date.now();

        for (const timing of timings) {
          const triggerMs = deadlineMs - NOTIFY_TIMING_MS[timing];
          const key = `${goal.id}:${timing}`;

          if (now >= triggerMs && !notifiedRef.current.has(key)) {
            notifiedRef.current.add(key);
            addNotifiedKey(key);
            changed = true;

            playAlert();

            const isDeadline = timing === "0";
            const label = t(NOTIFY_TIMING_I18N_KEYS[timing]);
            const title = isDeadline ? t("goals.timeUp") : label;
            const body = isDeadline ? goal.title : `${goal.title} - ${label}`;

            if (typeof Notification !== "undefined" && Notification.permission === "granted") {
              new Notification(title, { body });
            }

            if (isDeadline) {
              newCompleted.add(goal.id);
            }
          }
        }
      }

      if (changed) {
        setCompletedGoalIds(new Set(newCompleted));
      }
    };

    check();
    const id = setInterval(check, 1000);
    return () => clearInterval(id);
  }, [activeGoals, completedGoalIds]);

  return { completedGoalIds };
}
