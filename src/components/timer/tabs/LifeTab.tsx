"use client";

import { LifeConfig } from "@/types";
import { t } from "@/lib/i18n";
import LifeCountdown from "@/components/timer/LifeCountdown";
import { HourglassIcon } from "@/components/shared/Icons";

interface Props {
  lifeConfig: LifeConfig | null;
  onEditLife: () => void;
}

export default function LifeTab({ lifeConfig, onEditLife }: Props) {
  return (
    <div className="animate-tab-enter">
      <h2 className="text-lg font-bold mb-4">{t("life.title")}</h2>
      {lifeConfig ? (
        <LifeCountdown config={lifeConfig} onEdit={onEditLife} />
      ) : (
        <button
          onClick={onEditLife}
          className="w-full bg-card backdrop-blur-sm rounded-2xl p-8 border border-dashed border-card text-center hover:opacity-80 transition-opacity"
        >
          <HourglassIcon size={32} className="mx-auto mb-3 text-muted" />
          <span className="text-muted text-sm">{t("life.setup")}</span>
        </button>
      )}
    </div>
  );
}
