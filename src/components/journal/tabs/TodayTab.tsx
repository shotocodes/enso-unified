"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { type Locale, t, tFormat } from "@/lib/i18n";
import type { DailyJournal, ManualEntry, EntryIcon } from "@/types";
import {
  TrashIcon, PenIcon, FireIcon, SparkleIcon,
  MoodFace1, MoodFace2, MoodFace3, MoodFace4, MoodFace5,
  TargetIcon, CheckCircleIcon, FileTextIcon, LightbulbIcon,
} from "@/components/shared/Icons";

const MOOD_FACES = [MoodFace1, MoodFace2, MoodFace3, MoodFace4, MoodFace5] as const;

// アクティビティアイコンのSVGコンポーネントマッピング
const ICON_COMPONENTS: Record<EntryIcon, React.FC<{ size?: number; className?: string }>> = {
  focus: TargetIcon,
  done: CheckCircleIcon,
  memo: FileTextIcon,
  idea: LightbulbIcon,
};

const ICON_COLORS: Record<EntryIcon, string> = {
  focus: "text-blue-400",
  done: "text-emerald-500",
  memo: "text-amber-400",
  idea: "text-purple-400",
};

interface TodayTabProps {
  locale: Locale;
  entries: DailyJournal[];
  onEntriesChange: (entries: DailyJournal[]) => void;
}

function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getTodayStr(): string {
  return toLocalDateStr(new Date());
}

function getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const h = new Date().getHours();
  if (h < 6) return "night";
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  if (h < 22) return "evening";
  return "night";
}

function formatDate(dateStr: string, locale: Locale): string {
  const d = new Date(dateStr + "T00:00:00");
  const loc = locale === "ja" ? "ja-JP" : locale === "en" ? "en-US" : locale === "zh" ? "zh-CN" : "ko-KR";
  return d.toLocaleDateString(loc, { month: "long", day: "numeric", weekday: "long" });
}

function getNowTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export default function TodayTab({ locale, entries, onEntriesChange }: TodayTabProps) {
  const [todayStr, setTodayStr] = useState(getTodayStr);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [editEntry, setEditEntry] = useState<ManualEntry | null>(null);
  const [editingAiSummary, setEditingAiSummary] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const noteRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 日付変更検知
  useEffect(() => {
    const handler = () => {
      const now = getTodayStr();
      if (now !== todayStr) setTodayStr(now);
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [todayStr]);

  const today = useMemo(() => {
    return entries.find((e) => e.date === todayStr) ?? null;
  }, [entries, todayStr]);

  const ensureTodayExists = useCallback((): DailyJournal => {
    const existing = entries.find((e) => e.date === todayStr);
    if (existing) return { ...existing, notes: existing.notes ?? [] };
    const newEntry: DailyJournal = {
      date: todayStr,
      notes: [],
      manualEntries: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onEntriesChange([newEntry, ...entries]);
    return newEntry;
  }, [entries, todayStr, onEntriesChange]);

  const updateToday = useCallback((updater: (entry: DailyJournal) => DailyJournal) => {
    const current = ensureTodayExists();
    const updated = updater({ ...current, updatedAt: new Date().toISOString() });
    const next = entries.map((e) => (e.date === todayStr ? updated : e));
    if (!entries.find((e) => e.date === todayStr)) next.unshift(updated);
    onEntriesChange(next);
  }, [entries, todayStr, ensureTodayExists, onEntriesChange]);

  // 3年日記
  const flashbacks = useMemo(() => {
    const [y, m, d] = todayStr.split("-");
    const results: { year: number; label: string; entry: DailyJournal | null }[] = [];
    for (let offset = 1; offset <= 2; offset++) {
      const pastDate = `${Number(y) - offset}-${m}-${d}`;
      results.push({
        year: Number(y) - offset,
        label: offset === 1 ? t("today.flashback", locale) : t("today.flashback2", locale),
        entry: entries.find((e) => e.date === pastDate) ?? null,
      });
    }
    return results;
  }, [entries, todayStr, locale]);

  const streak = useMemo(() => {
    const dates = new Set(entries.map((e) => e.date));
    let count = 0;
    const current = new Date();
    for (let i = 0; i < 1000; i++) {
      if (dates.has(toLocalDateStr(current))) {
        count++;
        current.setDate(current.getDate() - 1);
      } else break;
    }
    return count;
  }, [entries]);

  const handleMoodChange = (mood: 1 | 2 | 3 | 4 | 5) => {
    updateToday((e) => ({ ...e, mood: e.mood === mood ? undefined : mood }));
  };

  const handleAddNote = () => {
    const current = today?.notes ?? [];
    updateToday((e) => ({ ...e, notes: [...(e.notes ?? []), ""] }));
    // 次のレンダー後にフォーカス
    setTimeout(() => {
      const idx = current.length;
      noteRefs.current[idx]?.focus();
    }, 50);
  };

  const handleUpdateNote = (index: number, value: string) => {
    const current = [...(today?.notes ?? [])];
    current[index] = value;
    updateToday((e) => ({ ...e, notes: current }));
  };

  const handleRemoveNote = (index: number) => {
    const current = [...(today?.notes ?? [])];
    current.splice(index, 1);
    updateToday((e) => ({ ...e, notes: current }));
  };

  const handleSetAiSummary = (aiSummary: string) => {
    updateToday((e) => ({ ...e, aiSummary }));
  };

  const handleAddEntry = (entry: ManualEntry) => {
    updateToday((e) => ({
      ...e,
      manualEntries: [...e.manualEntries, entry].sort((a, b) => a.time.localeCompare(b.time)),
    }));
    setShowAddEntry(false);
  };

  const handleDeleteEntry = (id: string) => {
    updateToday((e) => ({
      ...e,
      manualEntries: e.manualEntries.filter((m) => m.id !== id),
    }));
    setDeleteId(null);
  };

  const handleEditEntry = (updated: ManualEntry) => {
    updateToday((e) => ({
      ...e,
      manualEntries: e.manualEntries.map((m) => m.id === updated.id ? updated : m).sort((a, b) => a.time.localeCompare(b.time)),
    }));
    setEditEntry(null);
  };

  const hasFlashbackData = flashbacks.some((f) => f.entry !== null);
  const isFirstTime = entries.length <= 1 && !hasFlashbackData;

  return (
    <div className="animate-tab-enter space-y-5">
      {/* 日付 + ストリーク */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{formatDate(todayStr, locale)}</h2>
        {streak > 0 && (
          <span className="text-sm font-medium flex items-center gap-1">
            <FireIcon size={16} className="text-orange-400" />
            {tFormat("today.streak", locale, streak)}
          </span>
        )}
      </div>

      {/* 3年日記セクション */}
      {(hasFlashbackData || isFirstTime) && (
        <div className="space-y-3">
          {isFirstTime ? (
            <div className="bg-card border border-emerald-500/10 rounded-2xl p-5 text-center space-y-2">
              <svg width={32} height={32} viewBox="0 0 100 100" fill="none" className="mx-auto text-emerald-500 opacity-60">
                <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.9" />
                <line x1="38" y1="42" x2="62" y2="42" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
                <line x1="38" y1="50" x2="62" y2="50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.65" />
                <line x1="38" y1="58" x2="62" y2="58" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="1" />
              </svg>
              <p className="text-xs text-muted">{t("today.flashback.first", locale)}</p>
            </div>
          ) : (
            flashbacks.map(({ year, label, entry }) =>
              entry ? (
                <div key={year} className="bg-card border border-card rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted font-medium">{label}</span>
                    <span className="text-xs text-muted tabular-nums">{entry.date}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    {entry.mood && (() => {
                      const Face = MOOD_FACES[entry.mood - 1];
                      return <Face size={24} className="text-emerald-500 shrink-0" />;
                    })()}
                    <div className="flex-1 min-w-0">
                      {entry.aiSummary ? (
                        <p className="text-sm leading-relaxed line-clamp-2">{entry.aiSummary}</p>
                      ) : (entry.notes ?? []).filter(n => n.trim()).length > 0 ? (
                        <p className="text-sm leading-relaxed line-clamp-2">{(entry.notes ?? []).filter(n => n.trim()).join(" / ")}</p>
                      ) : entry.manualEntries.length > 0 ? (
                        <p className="text-xs text-muted">{tFormat("timeline.activities", locale, entry.manualEntries.length)}</p>
                      ) : (
                        <p className="text-xs text-muted italic">—</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null
            )
          )}
        </div>
      )}

      {/* アクティビティログ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold">{t("today.activity", locale)}</h3>
          <button
            onClick={() => setShowAddEntry(true)}
            className="text-xs font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
          >
            {t("today.addEntry", locale)}
          </button>
        </div>

        {(!today || today.manualEntries.length === 0) ? (
          <div className="border-2 border-dashed border-card rounded-2xl p-6 text-center space-y-3">
            <FileTextIcon size={28} className="mx-auto text-muted opacity-40 mb-2" />
            <p className="text-sm text-muted">{t("today.noActivity", locale)}</p>
            <p className="text-xs text-muted opacity-50">{t("today.noActivityHint", locale)}</p>
            <div className="flex flex-col gap-2 pt-1">
              <a href="https://ensolife.app/focus" className="inline-block px-4 py-2 rounded-xl text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
                {t("today.openFocus", locale)}
              </a>
              <a href="https://ensolife.app/task" className="inline-block px-4 py-2 rounded-xl text-xs font-medium bg-subtle text-muted hover:text-emerald-500 transition-colors">
                {t("today.openTask", locale)}
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {today.manualEntries.map((entry) => {
              const Icon = ICON_COMPONENTS[entry.icon];
              return (
                <div key={entry.id} className="bg-card border border-card rounded-xl p-3 flex items-center gap-3">
                  <Icon size={20} className={`shrink-0 ${ICON_COLORS[entry.icon]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{entry.text}</p>
                    <p className="text-xs text-muted tabular-nums">{entry.time}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setEditEntry(entry)}
                      className="text-muted hover:text-emerald-500 transition-colors"
                    >
                      <PenIcon size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteId(entry.id)}
                      className="text-muted hover:text-red-400 transition-colors"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOCUS連携 CTA */}
      <p className="text-center text-[10px] text-muted opacity-40">{t("today.focusCTA", locale)}</p>

      {/* 今日のまとめ（箇条書き + AI生成） */}
      <div className="bg-card border border-card rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">{t("today.notes", locale)}</h3>
          <button
            onClick={handleAddNote}
            className="text-xs font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
          >
            {t("today.addNote", locale)}
          </button>
        </div>

        {/* AI生成の日記（クリックで編集可能） */}
        {today?.aiSummary && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-emerald-500/60">AI</p>
              <button
                onClick={() => setEditingAiSummary(!editingAiSummary)}
                className="text-emerald-500/40 hover:text-emerald-500 transition-colors"
              >
                <PenIcon size={12} />
              </button>
            </div>
            {editingAiSummary ? (
              <textarea
                value={today.aiSummary}
                onChange={(e) => handleSetAiSummary(e.target.value)}
                rows={4}
                className="w-full bg-transparent text-sm resize-none focus:outline-none leading-relaxed"
                style={{ color: "var(--text)" }}
                autoFocus
                onBlur={() => setEditingAiSummary(false)}
              />
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{today.aiSummary}</p>
            )}
          </div>
        )}

        {/* 箇条書きメモ */}
        {(today?.notes ?? []).length > 0 ? (
          <div className="space-y-2">
            {(today?.notes ?? []).map((note, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-emerald-500 mt-2.5 text-xs shrink-0">•</span>
                <input
                  ref={(el) => { noteRefs.current[i] = el; }}
                  type="text"
                  value={note}
                  onChange={(e) => handleUpdateNote(i, e.target.value)}
                  placeholder={t(`today.comment.${getTimeOfDay()}`, locale)}
                  className="flex-1 bg-transparent text-sm py-1.5 border-b border-card focus:border-emerald-500/50 focus:outline-none placeholder:text-muted transition-colors"
                  style={{ color: "var(--text)" }}
                  onKeyDown={(e) => {
                    // IME変換中はスキップ
                    if (e.nativeEvent.isComposing) return;
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddNote();
                    }
                    if (e.key === "Backspace" && note === "") {
                      e.preventDefault();
                      handleRemoveNote(i);
                      // 前のノートにフォーカス
                      if (i > 0) setTimeout(() => noteRefs.current[i - 1]?.focus(), 50);
                    }
                  }}
                />
                <button
                  onClick={() => handleRemoveNote(i)}
                  className="text-muted hover:text-red-400 transition-colors mt-2 shrink-0"
                >
                  <TrashIcon size={12} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted text-center py-2 opacity-50">{t("today.notesHint", locale)}</p>
        )}

        {/* AI日記生成ボタン */}
        {(today?.manualEntries ?? []).length > 0 && (
          <button
            onClick={async () => {
              if (aiLoading) return;
              setAiLoading(true);
              try {
                const res = await fetch("/api/journal/generate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    activities: (today?.manualEntries ?? []).map((e) => ({
                      time: e.time, text: e.text, icon: e.icon,
                    })),
                    notes: (today?.notes ?? []).filter((n) => n.trim()),
                    mood: today?.mood,
                    locale,
                  }),
                });
                const data = await res.json();
                if (data.summary) handleSetAiSummary(data.summary);
              } catch (e) {
                console.error("AI generation failed:", e);
              } finally {
                setAiLoading(false);
              }
            }}
            disabled={aiLoading}
            className="w-full py-2.5 rounded-xl text-sm font-medium bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors border border-emerald-500/20 disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-1.5">
              {!aiLoading && <SparkleIcon size={16} />}
              {aiLoading ? t("today.aiGenerating", locale) : t("today.generateAi", locale)}
            </span>
          </button>
        )}
      </div>

      {/* 気分セレクター */}
      <div className="bg-card border border-card rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold">{t("today.mood", locale)}</h3>
        <div className="flex justify-around">
          {MOOD_FACES.map((Face, i) => {
            const moodVal = (i + 1) as 1 | 2 | 3 | 4 | 5;
            const isActive = today?.mood === moodVal;
            return (
              <button
                key={i}
                onClick={() => handleMoodChange(moodVal)}
                className="flex flex-col items-center gap-2 transition-all"
              >
                <Face
                  size={36}
                  className={`transition-all duration-200 ${
                    isActive
                      ? "text-emerald-500 scale-110"
                      : "text-muted opacity-40 hover:opacity-70 scale-90"
                  }`}
                />
                <span className={`text-[10px] font-medium ${
                  isActive ? "text-emerald-500" : "text-muted"
                }`}>
                  {t(`today.mood.${moodVal}`, locale)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 自動保存済み */}
      <p className="text-center text-xs text-muted">{t("today.autosaved", locale)}</p>

      {/* エントリー追加モーダル */}
      {showAddEntry && (
        <AddEntryModal locale={locale} onSave={handleAddEntry} onClose={() => setShowAddEntry(false)} />
      )}

      {/* エントリー編集モーダル */}
      {editEntry && (
        <AddEntryModal locale={locale} initial={editEntry} onSave={handleEditEntry} onClose={() => setEditEntry(null)} />
      )}

      {/* 削除確認モーダル */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in" onClick={() => setDeleteId(null)}>
          <div className="w-full max-w-sm bg-modal rounded-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-center">{t("modal.confirm", locale)}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl text-sm bg-subtle text-muted hover:opacity-80 transition-opacity">
                {t("modal.cancel", locale)}
              </button>
              <button onClick={() => handleDeleteEntry(deleteId)} className="flex-1 py-2.5 rounded-xl text-sm text-red-400 bg-subtle hover:opacity-80 transition-opacity">
                {t("modal.delete", locale)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== エントリー追加/編集モーダル =====
function AddEntryModal({
  locale,
  initial,
  onSave,
  onClose,
}: {
  locale: Locale;
  initial?: ManualEntry;
  onSave: (entry: ManualEntry) => void;
  onClose: () => void;
}) {
  const isEdit = !!initial;
  const [time, setTime] = useState(initial?.time ?? getNowTime());
  const [text, setText] = useState(initial?.text ?? "");
  const [icon, setIcon] = useState<EntryIcon>(initial?.icon ?? "memo");
  const [composing, setComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleSave = () => {
    if (!text.trim()) return;
    onSave({ id: initial?.id ?? Date.now().toString(), time, text: text.trim(), icon });
  };

  const icons: { id: EntryIcon; key: string }[] = [
    { id: "focus", key: "entry.focus" },
    { id: "done",  key: "entry.done" },
    { id: "memo",  key: "entry.memo" },
    { id: "idea",  key: "entry.idea" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-sm bg-modal rounded-2xl p-5 space-y-3 overflow-hidden" onClick={(e) => e.stopPropagation()}>

        <h3 className="text-sm font-bold text-center">
          {isEdit ? t("entry.edit.title", locale) : t("entry.add.title", locale)}
        </h3>

        {/* 時刻 */}
        <div>
          <label className="text-xs text-muted block mb-1">{t("entry.add.time", locale)}</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-input border border-input rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
            style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text)" }}
          />
        </div>

        {/* 内容 */}
        <div>
          <label className="text-xs text-muted block mb-1">{t("entry.add.text", locale)}</label>
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("entry.add.placeholder", locale)}
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={() => setComposing(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !composing) handleSave();
            }}
            className="w-full bg-input border border-input rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder:text-muted"
            style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text)" }}
          />
        </div>

        {/* アイコン選択（SVGアイコン + カラー） */}
        <div>
          <label className="text-xs text-muted block mb-2">{t("entry.add.icon", locale)}</label>
          <div className="flex gap-2">
            {icons.map(({ id, key }) => {
              const Icon = ICON_COMPONENTS[id];
              const isSelected = icon === id;
              return (
                <button
                  key={id}
                  onClick={() => setIcon(id)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-xs transition-all ${
                    isSelected
                      ? "bg-emerald-500/15 border border-emerald-500/30"
                      : "bg-subtle border border-transparent hover:opacity-80"
                  }`}
                >
                  <Icon size={22} className={isSelected ? ICON_COLORS[id] : "text-muted"} />
                  <span className={isSelected ? "text-emerald-500" : "text-muted"}>{t(key, locale)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm bg-subtle text-muted hover:opacity-80 transition-opacity">
            {t("modal.cancel", locale)}
          </button>
          <button
            onClick={handleSave}
            disabled={!text.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {t(isEdit ? "entry.edit.save" : "entry.add.save", locale)}
          </button>
        </div>
      </div>
    </div>
  );
}
