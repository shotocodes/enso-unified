"use client";

import { useState, useMemo } from "react";
import { type Locale, t, tFormat } from "@/lib/i18n";
import type { DailyJournal, EntryIcon } from "@/types";
import {
  MoodFace1, MoodFace2, MoodFace3, MoodFace4, MoodFace5,
  TargetIcon, CheckCircleIcon, FileTextIcon, LightbulbIcon, CalendarIcon,
} from "@/components/shared/Icons";

const MOOD_FACES = [MoodFace1, MoodFace2, MoodFace3, MoodFace4, MoodFace5] as const;

const ICON_COMPONENTS: Record<EntryIcon, React.FC<{ size?: number; className?: string }>> = {
  focus: TargetIcon, done: CheckCircleIcon, memo: FileTextIcon, idea: LightbulbIcon,
};
const ICON_COLORS: Record<EntryIcon, string> = {
  focus: "text-blue-400", done: "text-emerald-500", memo: "text-amber-400", idea: "text-purple-400",
};

interface TimelineTabProps {
  locale: Locale;
  entries: DailyJournal[];
}

function formatDateShort(dateStr: string, locale: Locale): string {
  const d = new Date(dateStr + "T00:00:00");
  const loc = locale === "ja" ? "ja-JP" : locale === "en" ? "en-US" : locale === "zh" ? "zh-CN" : "ko-KR";
  return d.toLocaleDateString(loc, { month: "short", day: "numeric", weekday: "short" });
}

export default function TimelineTab({ locale, entries }: TimelineTabProps) {
  const [moodFilter, setMoodFilter] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState("");  // "YYYY-MM-DD" for date picker

  // フィルター適用
  const filtered = useMemo(() => {
    let result = [...entries].sort((a, b) => b.date.localeCompare(a.date));

    // 日付フィルター
    if (dateFilter) {
      result = result.filter((e) => e.date === dateFilter);
    }

    // 気分フィルター
    if (moodFilter) {
      result = result.filter((e) => e.mood === moodFilter);
    }

    // テキスト検索（日付・AI要約・メモ・アクティビティ内容すべて対象）
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter((e) =>
        e.date.includes(q) ||
        formatDateShort(e.date, locale).toLowerCase().includes(q) ||
        (e.aiSummary ?? "").toLowerCase().includes(q) ||
        (e.notes ?? []).some((n) => n.toLowerCase().includes(q)) ||
        e.manualEntries.some((m) => m.text.toLowerCase().includes(q))
      );
    }

    return result;
  }, [entries, moodFilter, searchText, dateFilter, locale]);

  return (
    <div className="animate-tab-enter space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{t("timeline.title", locale)}</h2>
        <span className="text-xs text-muted">{tFormat("timeline.entries", locale, entries.length)}</span>
      </div>

      {/* フィルター */}
      {entries.length > 0 && (
        <div className="space-y-3">
          {/* 気分フィルター + 日付ピッカー */}
          <div className="flex gap-2 items-center">
            <button
              onClick={() => { setMoodFilter(null); setDateFilter(""); }}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                moodFilter === null && !dateFilter ? "bg-emerald-500 text-white" : "bg-subtle text-muted hover:opacity-80"
              }`}
            >
              {t("timeline.all", locale)}
            </button>
            {MOOD_FACES.map((Face, i) => (
              <button
                key={i}
                onClick={() => setMoodFilter(moodFilter === i + 1 ? null : i + 1)}
                className="transition-all"
              >
                <Face
                  size={24}
                  className={`transition-all ${
                    moodFilter === i + 1
                      ? "text-emerald-500 scale-110"
                      : "text-muted opacity-40 hover:opacity-70 scale-90"
                  }`}
                />
              </button>
            ))}
            {/* 日付ピッカー */}
            <div className="ml-auto relative">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
              />
              <CalendarIcon
                size={20}
                className={`cursor-pointer transition-colors ${dateFilter ? "text-emerald-500" : "text-muted hover:text-emerald-500"}`}
              />
            </div>
          </div>

          {/* 日付フィルター表示 */}
          {dateFilter && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-500">{formatDateShort(dateFilter, locale)}</span>
              <button
                onClick={() => setDateFilter("")}
                className="text-xs text-muted hover:text-red-400 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {/* テキスト検索 */}
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={t("timeline.search", locale)}
            className="w-full bg-input border border-input rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder:text-muted"
            style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text)" }}
          />
        </div>
      )}

      {/* エントリー一覧 */}
      {filtered.length === 0 ? (
        <div className="border-2 border-dashed border-card rounded-2xl p-8 text-center">
          <FileTextIcon size={32} className="mx-auto text-muted opacity-40 mb-3" />
          <p className="text-sm text-muted">{t("timeline.empty", locale)}</p>
          <p className="text-xs text-muted mt-1 opacity-50">{t("timeline.emptyHint", locale)}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => {
            const isExpanded = expandedDate === entry.date;
            return (
              <div
                key={entry.date}
                className="bg-card border border-card rounded-2xl p-4 cursor-pointer transition-colors hover:border-emerald-500/20"
                onClick={() => setExpandedDate(isExpanded ? null : entry.date)}
              >
                {/* ヘッダー */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{formatDateShort(entry.date, locale)}</span>
                  {entry.mood && (() => {
                    const Face = MOOD_FACES[entry.mood - 1];
                    return <Face size={28} className="text-emerald-500" />;
                  })()}
                </div>

                {/* サマリー（折りたたみ時） */}
                {!isExpanded && (
                  <div className="mt-2">
                    {entry.manualEntries.length > 0 && (
                      <p className="text-xs text-muted">
                        {tFormat("timeline.activities", locale, entry.manualEntries.length)}
                      </p>
                    )}
                    {entry.aiSummary && (
                      <p className="text-sm text-muted mt-1 line-clamp-1">{entry.aiSummary}</p>
                    )}
                    {!entry.aiSummary && (entry.notes ?? []).filter(n => n.trim()).length > 0 && (
                      <p className="text-sm text-muted mt-1 line-clamp-1">
                        {(entry.notes ?? []).filter(n => n.trim())[0]}
                      </p>
                    )}
                  </div>
                )}

                {/* 詳細（展開時） */}
                {isExpanded && (
                  <div className="mt-3 space-y-3 animate-fade-in">
                    {entry.manualEntries.length > 0 && (
                      <div className="space-y-1.5">
                        {entry.manualEntries.map((m) => {
                          const Icon = ICON_COMPONENTS[m.icon];
                          return (
                            <div key={m.id} className="flex items-center gap-2 text-sm">
                              <Icon size={16} className={ICON_COLORS[m.icon]} />
                              <span className="text-xs text-muted tabular-nums w-12">{m.time}</span>
                              <span className="flex-1 min-w-0 truncate">{m.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {entry.aiSummary && (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                        <p className="text-xs text-emerald-500/60 mb-1">AI</p>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{entry.aiSummary}</p>
                      </div>
                    )}

                    {(entry.notes ?? []).filter(n => n.trim()).length > 0 && (
                      <div className="bg-subtle rounded-xl p-3 space-y-1">
                        {(entry.notes ?? []).filter(n => n.trim()).map((note, ni) => (
                          <p key={ni} className="text-sm flex gap-2">
                            <span className="text-emerald-500 shrink-0">•</span>
                            {note}
                          </p>
                        ))}
                      </div>
                    )}

                    {!entry.aiSummary && (entry.notes ?? []).filter(n => n.trim()).length === 0 && entry.manualEntries.length === 0 && (
                      <p className="text-xs text-muted italic text-center py-2">—</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
