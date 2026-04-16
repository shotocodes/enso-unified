"use client";

import { TimeUnit } from "@/types";
import { t } from "@/lib/i18n";

interface Props {
  value: TimeUnit;
  onChange: (unit: TimeUnit) => void;
}

const units: { key: TimeUnit; labelKey: string }[] = [
  { key: "days", labelKey: "time.daysLabel" },
  { key: "hours", labelKey: "time.hoursLabel" },
  { key: "minutes", labelKey: "time.minutesLabel" },
  { key: "seconds", labelKey: "time.secondsLabel" },
];

export default function TimeUnitSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-1.5">
      {units.map((u) => (
        <button
          key={u.key}
          onClick={() => onChange(u.key)}
          className={`flex-1 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            value === u.key
              ? "bg-emerald-500 text-white"
              : "bg-subtle text-muted hover:opacity-80"
          }`}
        >
          {t(u.labelKey)}
        </button>
      ))}
    </div>
  );
}
