"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import { getStats, getDailyStats, getSessions, clearSessions, getTagStats, getStreak, getTags } from "@/lib/storage";
import { FocusSession } from "@/types";

type Period = "7days" | "1month" | "all";

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}${t("time.seconds")}`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}${t("time.hours")} ${m}${t("time.minutes")}`;
  return `${m}${t("time.minutes")}`;
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function filterByPeriod(sessions: FocusSession[], period: Period): FocusSession[] {
  if (period === "all") return sessions;
  const now = Date.now();
  const cutoff = period === "7days" ? now - 7 * 86400000 : now - 30 * 86400000;
  return sessions.filter((s) => new Date(s.endedAt).getTime() >= cutoff);
}

export default function HistoryTab() {
  const [version, setVersion] = useState(0);
  const [period, setPeriod] = useState<Period>("7days");
  const stats = getStats();
  const daily = getDailyStats(7);
  const streak = getStreak();
  const allSessions = getSessions();
  const filteredSessions = filterByPeriod(allSessions, period).slice().reverse();
  const tagStats = getTagStats();
  const tags = getTags();
  const tagMap = new Map(tags.map((t) => [t.id, t]));
  const maxDaily = Math.max(...daily.map((d) => d.duration), 1);

  // Weekly average
  const daysWithData = daily.filter((d) => d.duration > 0).length;
  const weeklyAvg = daysWithData > 0 ? Math.round(stats.week / daysWithData / 60) : 0;

  // Donut chart data
  const totalTagDuration = Object.values(tagStats).reduce((a, b) => a + b, 0);
  const donutSegments: { tag: string; color: string; label: string; percent: number }[] = [];
  if (totalTagDuration > 0) {
    for (const [tagId, duration] of Object.entries(tagStats)) {
      if (tagId === "none") continue;
      const tagDef = tagMap.get(tagId);
      donutSegments.push({
        tag: tagId,
        color: tagDef?.color || "#6b7280",
        label: tagDef?.name || tagId,
        percent: duration / totalTagDuration,
      });
    }
    if (tagStats["none"]) donutSegments.push({ tag: "none", color: "rgba(128,128,128,0.4)", label: t("history.noTag"), percent: tagStats["none"] / totalTagDuration });
  }

  const handleClear = () => { if (confirm(t("history.clearConfirm"))) { clearSessions(); setVersion((v) => v + 1); } };
  const dayLabel = (dateStr: string) => { const d = new Date(dateStr); return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()]; };

  const donutSize = 120; const donutStroke = 16; const donutRadius = (donutSize - donutStroke) / 2; const donutCircumference = 2 * Math.PI * donutRadius;

  return (
    <div className="animate-tab-enter space-y-6" key={version}>
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: t("history.today"), value: stats.today },
          { label: t("history.thisWeek"), value: stats.week },
          { label: t("history.thisMonth"), value: stats.month },
          { label: t("history.total"), value: stats.total },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card rounded-2xl p-4 border border-card">
            <div className="text-xs text-muted mb-1">{label}</div>
            <div className="text-xl font-semibold">{formatDuration(value)}</div>
          </div>
        ))}
      </div>

      {/* Streak + Weekly avg + Sessions */}
      <div className="flex items-center justify-center gap-6 text-center">
        {streak > 0 && (
          <div>
            <div className="text-2xl font-bold text-emerald-500">{streak}</div>
            <div className="text-[10px] text-muted">{t("history.streakDays")}</div>
          </div>
        )}
        {weeklyAvg > 0 && (
          <div>
            <div className="text-2xl font-bold">{weeklyAvg}{t("time.minutes")}</div>
            <div className="text-[10px] text-muted">{t("history.weeklyAvg")}{t("history.perDay")}</div>
          </div>
        )}
        <div>
          <div className="text-2xl font-bold">{stats.totalSessions}</div>
          <div className="text-[10px] text-muted">{t("history.sessions")}</div>
        </div>
      </div>

      {/* Category donut chart */}
      {donutSegments.length > 0 && (
        <div className="bg-card rounded-2xl p-4 border border-card">
          <h3 className="text-sm font-medium mb-4">{t("history.categories")}</h3>
          <div className="flex items-center gap-6">
            <svg width={donutSize} height={donutSize} className="shrink-0 transform -rotate-90">
              {(() => { let offset = 0; return donutSegments.map((seg) => {
                const dash = seg.percent * donutCircumference; const gap = donutCircumference - dash;
                const el = <circle key={seg.tag} cx={donutSize / 2} cy={donutSize / 2} r={donutRadius} fill="none" stroke={seg.color} strokeWidth={donutStroke} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset} strokeLinecap="round" />;
                offset += dash; return el;
              }); })()}
            </svg>
            <div className="flex flex-col gap-2 min-w-0">
              {donutSegments.map((seg) => (
                <div key={seg.tag} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="text-xs truncate">{seg.label}</span>
                  <span className="text-xs text-muted ml-auto">{Math.round(seg.percent * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7-day chart */}
      <div className="bg-card rounded-2xl p-4 border border-card">
        <h3 className="text-sm font-medium mb-4">{t("history.last7days")}</h3>
        <div className="flex items-end gap-2 h-24">
          {daily.map(({ date, duration }) => (
            <div key={date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center" style={{ height: "80px" }}>
                <div className="w-full max-w-[32px] rounded-t bg-emerald-500/70 transition-all"
                  style={{ height: `${Math.max((duration / maxDaily) * 80, duration > 0 ? 4 : 0)}px` }} />
              </div>
              <span className="text-[10px] text-muted">{dayLabel(date)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Session list */}
      <div className="space-y-3">
        <div className="flex gap-2">
          {(["7days", "1month", "all"] as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${period === p ? "bg-emerald-500 text-white" : "bg-subtle text-muted hover:text-white"}`}>
              {t(`history.period.${p}`)}
            </button>
          ))}
        </div>

        {filteredSessions.length > 0 ? (
          <div className="space-y-2">
            {filteredSessions.map((s) => (
              <div key={s.id} className="py-2 px-3 bg-card rounded-xl border border-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {s.tag && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tagMap.get(s.tag)?.color || "#6b7280" }} />}
                    <span className="text-sm text-muted">{formatShortDate(s.startedAt)}</span>
                  </div>
                  <span className="text-sm font-medium">{formatDuration(s.duration)}</span>
                </div>
                {s.memo && <p className="text-xs text-muted mt-1 truncate pl-4">{s.memo}</p>}
              </div>
            ))}
            <button onClick={handleClear} className="w-full text-center text-xs text-red-400/60 hover:text-red-400 py-2 transition-colors">
              {t("history.clearAll")}
            </button>
          </div>
        ) : (
          <div className="text-center py-8 px-4">
            <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" className="mx-auto mb-3 text-muted opacity-50">
              <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
            </svg>
            <p className="text-sm font-medium text-muted">{t("history.noSessions")}</p>
            <p className="text-xs text-muted opacity-60 mt-1">{t("history.noSessionsHint")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
