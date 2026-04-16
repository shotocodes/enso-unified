"use client";

import { t } from "@/lib/i18n";

interface Props {
  value: string;
  onChange: (value: string) => void;
  minYear?: number;
  maxYear?: number;
}

export default function DateSelect({ value, onChange, minYear = 1930, maxYear = 2060 }: Props) {
  const [year, month, day] = value
    ? value.split("-").map(Number)
    : [new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()];

  const daysInMonth = new Date(year || 2000, month || 1, 0).getDate();

  const update = (y: number, m: number, d: number) => {
    const clampedDay = Math.min(d, new Date(y, m, 0).getDate());
    onChange(`${y}-${String(m).padStart(2, "0")}-${String(clampedDay).padStart(2, "0")}`);
  };

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const ys = t("modal.yearSuffix");
  const ms = t("modal.monthSuffix");
  const ds = t("modal.daySuffix");

  const selectClass = "flex-1 bg-input border border-input rounded-lg px-2 py-3 text-base text-center appearance-none focus:outline-none";

  return (
    <div className="flex gap-2">
      <div className="relative flex-[2]">
        <select value={year || ""} onChange={(e) => update(Number(e.target.value), month, day)} className={selectClass + " w-full"}>
          {!year && <option value="">{ys}</option>}
          {years.map((y) => (
            <option key={y} value={y} className="bg-modal">{y}{ys}</option>
          ))}
        </select>
      </div>
      <div className="relative flex-1">
        <select value={month || ""} onChange={(e) => update(year, Number(e.target.value), day)} className={selectClass + " w-full"}>
          {!month && <option value="">{ms}</option>}
          {months.map((m) => (
            <option key={m} value={m} className="bg-modal">{m}{ms}</option>
          ))}
        </select>
      </div>
      <div className="relative flex-1">
        <select value={day || ""} onChange={(e) => update(year, month, Number(e.target.value))} className={selectClass + " w-full"}>
          {!day && <option value="">{ds}</option>}
          {days.map((d) => (
            <option key={d} value={d} className="bg-modal">{d}{ds}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
