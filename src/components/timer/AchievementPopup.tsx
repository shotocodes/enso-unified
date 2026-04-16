"use client";

import { useEffect, useRef, useState } from "react";
import { Goal } from "@/types";
import { t } from "@/lib/i18n";
import { playCelebration } from "@/lib/sound";
import { SparkleIcon } from "@/components/shared/Icons";

interface Props {
  goal: Goal;
  onConfirm: (memo?: string) => void;
  onClose: () => void;
}

export default function AchievementPopup({ goal, onConfirm, onClose }: Props) {
  const [memo, setMemo] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    playCelebration();
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleConfirm = () => {
    onConfirm(memo.trim() || undefined);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-modal rounded-2xl p-6 max-w-sm mx-4 w-full animate-celebrate"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-5">
          <SparkleIcon size={72} className="mx-auto mb-4 text-emerald-400" />
          <h2 className="text-2xl font-bold mb-2">{t("achievement.congrats")}</h2>
          <p className="text-muted text-sm mb-1">{t("achievement.achieved")}</p>
          <p className="text-emerald-400 font-bold text-lg">{goal.title}</p>
        </div>

        <textarea
          ref={inputRef}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder={t("achievement.memoPlaceholder")}
          rows={3}
          maxLength={200}
          className="w-full bg-input border border-input rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 mb-4"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleConfirm();
            }
          }}
        />

        <button
          onClick={handleConfirm}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors"
        >
          {t("achievement.confirm")}
        </button>
      </div>
    </div>
  );
}
