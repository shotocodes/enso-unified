"use client";

import { useState, useEffect } from "react";
import { LifeConfig } from "@/types";
import { t } from "@/lib/i18n";
import DateSelect from "./DateSelect";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (config: LifeConfig) => void;
  config: LifeConfig | null;
}

export default function LifeConfigModal({ open, onClose, onSave, config }: Props) {
  const [birthDate, setBirthDate] = useState("");
  const [lifeExpectancy, setLifeExpectancy] = useState(70);

  useEffect(() => {
    if (config) {
      setBirthDate(config.birthDate);
      setLifeExpectancy(config.lifeExpectancy);
    }
  }, [config, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) return;
    onSave({ birthDate, lifeExpectancy });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-modal rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-md border border-card pb-8"
      >
        <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-5 sm:hidden opacity-30" />
        <h2 className="text-lg font-bold mb-1">{t("modal.lifeConfig")}</h2>
        <p className="text-sm text-muted mb-5">{t("modal.lifeDesc")}</p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm text-muted mb-2">{t("modal.birthDate")}</label>
            <DateSelect value={birthDate} onChange={setBirthDate} minYear={1930} maxYear={new Date().getFullYear()} />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-muted">{t("modal.lifeExpectancy")}</label>
              <span className="text-sm font-bold">{lifeExpectancy}{t("modal.ageSuffix")}</span>
            </div>
            <input
              type="range"
              min={50}
              max={120}
              value={lifeExpectancy}
              onChange={(e) => setLifeExpectancy(Number(e.target.value))}
              className="w-full accent-emerald-500 h-2"
            />
            <div className="flex justify-between text-xs text-muted mt-1 opacity-50">
              <span>50{t("modal.ageSuffix")}</span>
              <span>120{t("modal.ageSuffix")}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl bg-subtle text-muted text-base hover:opacity-80 transition-opacity">
            {t("modal.cancel")}
          </button>
          <button type="submit" disabled={!birthDate} className="flex-1 py-3.5 rounded-xl bg-emerald-500 text-white text-base font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            {t("modal.save")}
          </button>
        </div>
      </form>
    </div>
  );
}
