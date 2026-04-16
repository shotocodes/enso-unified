"use client";

import { TimeRemaining, TimeUnit } from "@/types";
import { t } from "@/lib/i18n";
import { formatNumber } from "@/lib/time";

interface Props {
  time: TimeRemaining;
  unit: TimeUnit;
}

function Num({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-4xl sm:text-5xl font-bold tabular-nums leading-none">
      {children}
    </span>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-sm text-muted ml-1 mr-3 whitespace-nowrap">{children}</span>;
}

export default function CountdownDisplay({ time, unit }: Props) {
  const prefix = time.isPast ? "+" : "";

  const display = (() => {
    switch (unit) {
      case "days":
        return (
          <div className="space-y-1">
            <div className="flex items-baseline">
              <Num>{prefix}{formatNumber(time.days)}</Num>
              <Label>{t("time.days")}</Label>
            </div>
            <div className="flex items-baseline">
              <Num>{String(time.hours).padStart(2, "0")}</Num>
              <Label>{t("time.hours")}</Label>
              <Num>{String(time.minutes).padStart(2, "0")}</Num>
              <Label>{t("time.minutes")}</Label>
            </div>
          </div>
        );
      case "hours":
        return (
          <div className="flex items-baseline flex-wrap gap-y-1">
            <Num>{prefix}{formatNumber(time.days * 24 + time.hours)}</Num>
            <Label>{t("time.hours")}</Label>
          </div>
        );
      case "minutes":
        return (
          <div className="flex items-baseline flex-wrap gap-y-1">
            <Num>{prefix}{formatNumber(time.days * 1440 + time.hours * 60 + time.minutes)}</Num>
            <Label>{t("time.minutes")}</Label>
          </div>
        );
      case "seconds":
        return (
          <div className="flex items-baseline flex-wrap gap-y-1">
            <Num>{prefix}{formatNumber(time.days * 86400 + time.hours * 3600 + time.minutes * 60 + time.seconds)}</Num>
            <Label>{t("time.seconds")}</Label>
          </div>
        );
    }
  })();

  return (
    <div key={unit} className="animate-count-switch">
      {time.isPast && (
        <span className="text-red-400 text-xs font-medium block mb-1">{t("goals.overdue")}</span>
      )}
      {display}
    </div>
  );
}
