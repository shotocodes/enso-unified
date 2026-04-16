"use client";

import { useState, useEffect, useRef } from "react";
import { t } from "@/lib/i18n";
import { CustomTag } from "@/types";
import { CheckCircleIcon } from "@/components/shared/Icons";

interface Props {
  duration: number;
  tags: CustomTag[];
  defaultMemo?: string;
  onSave: (data: { memo: string; tag?: string }) => void;
  onSkip: () => void;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}${t("time.hours")} ${m}${t("time.minutes")}`;
  return `${m}${t("time.minutes")}`;
}

export default function CompletionModal({ duration, tags, defaultMemo, onSave, onSkip }: Props) {
  const [memo, setMemo] = useState(defaultMemo ?? "");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 300); }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onSkip(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSkip]);

  const handleSave = () => {
    onSave({ memo: memo.trim(), tag: selectedTagId ?? undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onSkip}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-modal rounded-2xl p-6 border border-card max-w-sm w-full animate-celebrate"
        onClick={(e) => e.stopPropagation()}>

        <div className="flex justify-center mb-3">
          <CheckCircleIcon size={48} className="text-emerald-500" />
        </div>

        <h2 className="text-xl font-bold text-center mb-1">{t("memo.title")}</h2>
        <p className="text-sm text-muted text-center mb-5">{formatDuration(duration)}</p>

        {/* Category tags */}
        {tags.length > 0 && (
          <div className="flex gap-2 flex-wrap justify-center mb-4">
            {tags.map((tag) => {
              const active = selectedTagId === tag.id;
              return (
                <button key={tag.id}
                  onClick={() => setSelectedTagId(active ? null : tag.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={active ? { backgroundColor: tag.color, color: "#fff" } : undefined}>
                  {!active && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />}
                  <span className={active ? "" : "text-muted"}>{tag.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Memo input */}
        <input ref={inputRef} type="text" value={memo}
          onChange={(e) => setMemo(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
          placeholder={t("memo.placeholder")}
          className="w-full bg-input border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors mb-4"
        />

        <div className="flex gap-3">
          <button onClick={onSkip}
            className="flex-1 py-2.5 rounded-xl bg-subtle text-muted text-sm font-medium hover:text-white transition-colors">
            {t("memo.skip")}
          </button>
          <button onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
            {t("memo.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
