"use client";

import { useState, useEffect } from "react";
import { LifeConfig, TimeUnit } from "@/types";
import { t } from "@/lib/i18n";
import { calcTimeRemaining, calcLifeDeadline, calcLifeProgress } from "@/lib/time";
import CountdownDisplay from "./CountdownDisplay";
import TimeUnitSelector from "./TimeUnitSelector";
import { HourglassIcon } from "@/components/shared/Icons";

interface Props {
  config: LifeConfig;
  onEdit: () => void;
}

export default function LifeCountdown({ config, onEdit }: Props) {
  const [unit, setUnit] = useState<TimeUnit>("days");
  const deadline = calcLifeDeadline(config.birthDate, config.lifeExpectancy);
  const [time, setTime] = useState(() => calcTimeRemaining(deadline));
  const [progress, setProgress] = useState(() =>
    calcLifeProgress(config.birthDate, config.lifeExpectancy)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(calcTimeRemaining(deadline));
      setProgress(calcLifeProgress(config.birthDate, config.lifeExpectancy));
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline, config.birthDate, config.lifeExpectancy]);

  return (
    <div className="bg-card backdrop-blur-sm rounded-2xl p-4 border border-card">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-base font-bold whitespace-nowrap flex items-center gap-1.5">
          <HourglassIcon size={18} />
          {t("life.title")}
        </h2>
        <button
          onClick={onEdit}
          className="text-muted text-xs border border-card rounded-full px-3 py-1 transition-opacity hover:opacity-80 shrink-0 ml-3"
        >
          {t("life.settings")}
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-muted">
            {config.lifeExpectancy}{t("life.until")}
          </span>
          <span className="text-sm text-muted tabular-nums">
            {progress.toFixed(1)}% {t("life.progress")}
          </span>
        </div>
        <div className="w-full bg-subtle rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              progress < 50
                ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                : progress < 75
                ? "bg-gradient-to-r from-emerald-400 to-amber-400"
                : "bg-gradient-to-r from-amber-400 to-red-400"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mb-3">
        <CountdownDisplay time={time} unit={unit} />
      </div>

      <TimeUnitSelector value={unit} onChange={setUnit} />
    </div>
  );
}
