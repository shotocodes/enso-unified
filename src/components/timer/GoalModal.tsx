"use client";

import { useState, useEffect, useMemo } from "react";
import { Goal, NotifyTiming, NOTIFY_TIMING_I18N_KEYS } from "@/types";
import { t } from "@/lib/i18n";
import { getDefaultNotifyTimings } from "@/lib/storage";
import DateSelect from "./DateSelect";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; deadline: string; notifyTimings: NotifyTiming[] }) => void;
  editGoal?: Goal | null;
}

const ALL_TIMINGS: NotifyTiming[] = ["2w", "1w", "3d", "1d", "1h", "0"];

export default function GoalModal({ open, onClose, onSave, editGoal }: Props) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("0");
  const [minute, setMinute] = useState("0");
  const [selectedTimings, setSelectedTimings] = useState<Set<NotifyTiming>>(new Set());

  const deadlineISO = useMemo(() => {
    if (!date) return null;
    const d = new Date(`${date}T00:00:00`);
    d.setHours(Number(hour), Number(minute), 0, 0);
    return d.toISOString();
  }, [date, hour, minute]);

  const msUntilDeadline = useMemo(() => {
    if (!deadlineISO) return 0;
    return new Date(deadlineISO).getTime() - Date.now();
  }, [deadlineISO]);

  const isLongTerm = msUntilDeadline > 30 * 24 * 60 * 60 * 1000;

  useEffect(() => {
    if (editGoal) {
      setTitle(editGoal.title);
      const d = new Date(editGoal.deadline);
      setDate(d.toISOString().split("T")[0]);
      setHour(String(d.getHours()));
      setMinute(String(d.getMinutes()));
      setSelectedTimings(new Set(editGoal.notifyTimings ?? getDefaultNotifyTimings(editGoal.deadline)));
    } else {
      setTitle("");
      setDate("");
      setHour("0");
      setMinute("0");
      setSelectedTimings(new Set());
    }
  }, [editGoal, open]);

  useEffect(() => {
    if (!editGoal && deadlineISO) {
      setSelectedTimings(new Set(getDefaultNotifyTimings(deadlineISO)));
    }
  }, [deadlineISO, editGoal]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    const d = new Date(`${date}T00:00:00`);
    d.setHours(Number(hour), Number(minute), 0, 0);
    onSave({ title: title.trim(), deadline: d.toISOString(), notifyTimings: [...selectedTimings] });
  };

  const toggleTiming = (timing: NotifyTiming) => {
    setSelectedTimings((prev) => {
      const next = new Set(prev);
      next.has(timing) ? next.delete(timing) : next.add(timing);
      return next;
    });
  };

  const MS: Record<NotifyTiming, number> = {
    "2w": 14*24*60*60*1000, "1w": 7*24*60*60*1000, "3d": 3*24*60*60*1000,
    "1d": 24*60*60*1000, "1h": 60*60*1000, "0": 0,
  };
  const availableTimings = ALL_TIMINGS.filter((t) => msUntilDeadline > MS[t]);
  if (!availableTimings.includes("0")) availableTimings.push("0");

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-modal rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-md border border-card pb-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-5 sm:hidden opacity-30" />
        <h2 className="text-lg font-bold mb-5">
          {editGoal ? t("modal.editGoal") : t("modal.addGoal")}
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm text-muted mb-2">{t("modal.goalName")}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("modal.goalPlaceholder")}
              className="w-full bg-input border border-input rounded-xl px-4 py-3 text-base placeholder:opacity-30 focus:outline-none focus:border-emerald-500/30"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-2">{t("modal.deadline")}</label>
            <DateSelect value={date} onChange={setDate} minYear={new Date().getFullYear()} maxYear={2100} />
          </div>

          <div>
            <label className="block text-sm text-muted mb-2">{t("modal.time")}</label>
            <div className="flex gap-2 items-center">
              <select value={hour} onChange={(e) => setHour(e.target.value)} className="flex-1 bg-input border border-input rounded-lg px-2 py-3 text-base text-center appearance-none focus:outline-none w-full">
                {hours.map((h) => (
                  <option key={h} value={h} className="bg-modal">
                    {String(h).padStart(2, "0")}{t("modal.hourSuffix")}
                  </option>
                ))}
              </select>
              <span className="text-muted font-bold">:</span>
              <select value={minute} onChange={(e) => setMinute(e.target.value)} className="flex-1 bg-input border border-input rounded-lg px-2 py-3 text-base text-center appearance-none focus:outline-none w-full">
                {minutes.map((m) => (
                  <option key={m} value={m} className="bg-modal">
                    {String(m).padStart(2, "0")}{t("modal.minuteSuffix")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {date && (
            <div>
              <label className="block text-sm text-muted mb-2">
                {t("modal.notifyTiming")}
                {isLongTerm && <span className="opacity-50 ml-1">({t("modal.customizable")})</span>}
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTimings.map((timing) => (
                  <button
                    key={timing}
                    type="button"
                    onClick={() => toggleTiming(timing)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      selectedTimings.has(timing)
                        ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                        : "bg-subtle text-muted border border-card"
                    }`}
                  >
                    {t(NOTIFY_TIMING_I18N_KEYS[timing])}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl bg-subtle text-muted text-base hover:opacity-80 transition-opacity">
            {t("modal.cancel")}
          </button>
          <button type="submit" disabled={!title.trim() || !date} className="flex-1 py-3.5 rounded-xl bg-emerald-500 text-white text-base font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            {t("modal.save")}
          </button>
        </div>
      </form>
    </div>
  );
}
