"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { t, LOCALES, type Locale } from "@/lib/i18n";
import type {
  ThemeMode, SoundSettings, TickSoundType,
  TimerConfig, AmbientSettings, AmbientSoundType,
  CompletionSoundType, CustomTag, DailyGoal, LifeConfig,
} from "@/types";
import {
  TICK_SOUND_I18N_KEYS,
  COMPLETION_SOUND_I18N_KEYS,
  AMBIENT_SOUND_I18N_KEYS,
  PALETTE,
} from "@/types";
import {
  getSoundSettings, saveSoundSettings,
  getTimerConfig, saveTimerConfig,
  getAmbientSettings, saveAmbientSettings,
  getCompletionSound, saveCompletionSound,
  getDailyGoal, saveDailyGoal,
  getFocusTags, saveFocusTags,
  getLifeConfig, saveLifeConfig,
  exportAllData, importAllData, clearAllData,
} from "@/lib/storage";
import { previewSound, playCompletionSound } from "@/lib/sound";
import { useAppShell } from "@/components/shared/AppShell";
import EnsoLogo from "@/components/shared/EnsoLogo";
import {
  ChevronLeftIcon, SpeakerOnIcon, SpeakerOffIcon,
} from "@/components/shared/Icons";
import LifeConfigModal from "@/components/timer/LifeConfigModal";

const FOCUS_OPTIONS = [15, 25, 30, 45, 60];
const BREAK_OPTIONS = [5, 10, 15, 20];
const GOAL_OPTIONS = [0, 30, 60, 90, 120, 180];
const TICK_TYPES: TickSoundType[] = ["classic", "soft", "digital"];
const THEMES: ThemeMode[] = ["dark", "light", "system"];

export default function SettingsPage() {
  const { locale, setLocale, theme, setTheme, mounted, user } = useAppShell();

  // Per-feature settings state (loaded from storage)
  const [tickSettings, setTickSettings] = useState<SoundSettings>({ enabled: false, tickSound: "classic", volume: 0.5 });
  const [timerConfig, setTimerConfig] = useState<TimerConfig>({ focusMinutes: 25, breakMinutes: 5, autoStartBreak: true });
  const [ambient, setAmbient] = useState<AmbientSettings>({ enabled: false, type: "thunder", volume: 0.3 });
  const [completionSound, setCompletionSound] = useState<CompletionSoundType>("celebration");
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>({ minutes: 0 });
  const [tags, setTags] = useState<CustomTag[]>([]);
  const [lifeConfig, setLifeConfig] = useState<LifeConfig | null>(null);
  const [showLifeModal, setShowLifeModal] = useState(false);

  // Notifications permission UI
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | "unsupported">("default");

  // Import / clear UI state
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setTickSettings(getSoundSettings());
    setTimerConfig(getTimerConfig());
    setAmbient(getAmbientSettings());
    setCompletionSound(getCompletionSound());
    setDailyGoal(getDailyGoal());
    setTags(getFocusTags());
    setLifeConfig(getLifeConfig());
    if (typeof Notification !== "undefined") setNotifPerm(Notification.permission);
    else setNotifPerm("unsupported");
  }, []);

  // ===== Save handlers =====

  const saveTick = useCallback((next: SoundSettings) => { setTickSettings(next); saveSoundSettings(next); }, []);
  const saveTimer = useCallback((next: TimerConfig) => { setTimerConfig(next); saveTimerConfig(next); }, []);
  const saveAmbientCfg = useCallback((next: AmbientSettings) => { setAmbient(next); saveAmbientSettings(next); }, []);
  const saveCompletion = useCallback((s: CompletionSoundType) => { setCompletionSound(s); saveCompletionSound(s); playCompletionSound(s); }, []);
  const saveGoal = useCallback((g: DailyGoal) => { setDailyGoal(g); saveDailyGoal(g); }, []);
  const saveTagsList = useCallback((list: CustomTag[]) => { setTags(list); saveFocusTags(list); }, []);

  // ===== Data export/import =====

  const handleExport = useCallback(() => {
    const json = exportAllData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const d = new Date();
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    a.download = `enso-${ds}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const ok = importAllData(text);
      setImportMsg({ ok, text: ok ? t("settings.importSuccess", locale) : t("settings.importFail", locale) });
      if (ok) setTimeout(() => window.location.reload(), 1000);
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  }, [locale]);

  const handleClearAll = useCallback(() => {
    clearAllData();
    window.location.reload();
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 pt-[max(1rem,env(safe-area-inset-top))]">
      {/* Header (no settings gear here) */}
      <header className="w-full flex items-center justify-between mb-6">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity" aria-label="Back">
          <ChevronLeftIcon size={20} className="text-muted" />
          <span className="text-sm font-medium text-muted">{t("settings.back", locale)}</span>
        </Link>
        <div className="flex items-center gap-2">
          <EnsoLogo size={20} className="text-emerald-500" />
          <span className="text-base font-bold tracking-tight">{t("settings.title", locale)}</span>
        </div>
        <div className="w-12" /> {/* spacer */}
      </header>

      <div className="space-y-5 pb-6">
        {/* Account */}
        <Section title={t("settings.section.account", locale)} description={t("settings.section.account.desc", locale)}>
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {user.user_metadata?.avatar_url && (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-muted uppercase tracking-wider">{t("settings.signedInAs", locale)}</p>
                  <p className="text-xs truncate">{user.email}</p>
                </div>
              </div>
              <form action="/auth/sign-out" method="post">
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg text-xs font-bold bg-subtle text-muted hover:opacity-80 transition-colors"
                >
                  {t("settings.signOut", locale)}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted">{t("settings.notSignedIn", locale)}</p>
              <Link
                href="/auth/sign-in"
                className="block text-center py-2.5 rounded-lg text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              >
                {t("settings.signIn", locale)}
              </Link>
            </div>
          )}
        </Section>

        {/* Appearance */}
        <Section title={t("settings.section.appearance", locale)} description={t("settings.section.appearance.desc", locale)}>
          <Row label={t("settings.theme", locale)}>
            <PillGroup
              options={THEMES.map((th) => ({ value: th, label: t(`theme.${th}`, locale) }))}
              value={theme}
              onChange={(v) => setTheme(v as ThemeMode)}
            />
          </Row>
          <Row label={t("settings.language", locale)}>
            <PillGroup
              options={LOCALES.map((l) => ({ value: l.code, label: t(`lang.${l.code}`, locale) }))}
              value={locale}
              onChange={(v) => setLocale(v as Locale)}
            />
          </Row>
        </Section>

        {/* Focus */}
        <Section title={t("settings.section.focus", locale)} description={t("settings.section.focus.desc", locale)}>
          <Row label={t("settings.focusDuration", locale)}>
            <PillGroup
              options={FOCUS_OPTIONS.map((m) => ({ value: String(m), label: `${m}` }))}
              value={String(timerConfig.focusMinutes)}
              onChange={(v) => saveTimer({ ...timerConfig, focusMinutes: Number(v) })}
            />
          </Row>
          <Row label={t("settings.breakDuration", locale)}>
            <PillGroup
              options={BREAK_OPTIONS.map((m) => ({ value: String(m), label: `${m}` }))}
              value={String(timerConfig.breakMinutes)}
              onChange={(v) => saveTimer({ ...timerConfig, breakMinutes: Number(v) })}
              accent="amber"
            />
          </Row>
          <Toggle
            label={t("settings.autoStartBreak", locale)}
            value={timerConfig.autoStartBreak}
            onChange={(b) => saveTimer({ ...timerConfig, autoStartBreak: b })}
          />
          <Row label={t("settings.completionSound", locale)}>
            <PillGroup
              options={(["celebration", "chime", "gentle", "none"] as CompletionSoundType[]).map((s) => ({
                value: s, label: t(COMPLETION_SOUND_I18N_KEYS[s], locale),
              }))}
              value={completionSound}
              onChange={(v) => saveCompletion(v as CompletionSoundType)}
            />
          </Row>
          <Row label={t("settings.dailyGoal", locale)}>
            <PillGroup
              options={GOAL_OPTIONS.map((m) => ({ value: String(m), label: m === 0 ? t("settings.goalOff", locale) : `${m}` }))}
              value={String(dailyGoal.minutes)}
              onChange={(v) => saveGoal({ minutes: Number(v) })}
            />
          </Row>
        </Section>

        {/* Ambient */}
        <Section
          title={t("settings.section.ambient", locale)}
          description={t("settings.section.ambient.desc", locale)}
          right={
            <button
              onClick={() => saveAmbientCfg({ ...ambient, enabled: !ambient.enabled })}
              className={`p-1.5 rounded-lg ${ambient.enabled ? "text-emerald-500" : "text-muted"}`}
              aria-label="Toggle ambient"
            >
              {ambient.enabled ? <SpeakerOnIcon size={18} /> : <SpeakerOffIcon size={18} />}
            </button>
          }
        >
          {ambient.enabled && (
            <>
              <Row label={t("settings.ambientType", locale)}>
                <PillGroup
                  options={(["thunder", "fire", "cafe", "birds", "waves"] as AmbientSoundType[]).map((s) => ({
                    value: s, label: t(AMBIENT_SOUND_I18N_KEYS[s], locale),
                  }))}
                  value={ambient.type}
                  onChange={(v) => saveAmbientCfg({ ...ambient, type: v as AmbientSoundType })}
                />
              </Row>
              <Row label={`${t("settings.ambientVolume", locale)} (${Math.round(ambient.volume * 100)}%)`}>
                <input
                  type="range" min={0} max={100}
                  value={Math.round(ambient.volume * 100)}
                  onChange={(e) => saveAmbientCfg({ ...ambient, volume: Number(e.target.value) / 100 })}
                  className="w-full accent-emerald-500"
                />
              </Row>
            </>
          )}
        </Section>

        {/* Timer ticking sound */}
        <Section
          title={t("settings.section.timer", locale)}
          description={t("settings.section.timer.desc", locale)}
          right={
            <button
              onClick={() => saveTick({ ...tickSettings, enabled: !tickSettings.enabled })}
              className={`p-1.5 rounded-lg ${tickSettings.enabled ? "text-emerald-500" : "text-muted"}`}
              aria-label="Toggle tick sound"
            >
              {tickSettings.enabled ? <SpeakerOnIcon size={18} /> : <SpeakerOffIcon size={18} />}
            </button>
          }
        >
          {tickSettings.enabled && (
            <>
              <Row label={t("settings.tickType", locale)}>
                <PillGroup
                  options={TICK_TYPES.map((s) => ({ value: s, label: t(TICK_SOUND_I18N_KEYS[s], locale) }))}
                  value={tickSettings.tickSound}
                  onChange={(v) => { saveTick({ ...tickSettings, tickSound: v as TickSoundType }); previewSound(v); }}
                />
              </Row>
              <Row label={`${t("settings.tickVolume", locale)} (${Math.round(tickSettings.volume * 100)}%)`}>
                <input
                  type="range" min={0} max={100}
                  value={Math.round(tickSettings.volume * 100)}
                  onChange={(e) => saveTick({ ...tickSettings, volume: Number(e.target.value) / 100 })}
                  className="w-full accent-emerald-500"
                />
              </Row>
            </>
          )}
        </Section>

        {/* Notifications */}
        <Section title={t("settings.section.notifications", locale)} description={t("settings.section.notifications.desc", locale)}>
          {notifPerm === "unsupported" ? (
            <p className="text-xs text-muted">{t("settings.notifUnsupported", locale)}</p>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">
                {notifPerm === "granted"
                  ? t("settings.notifEnabled", locale)
                  : notifPerm === "denied"
                  ? t("settings.notifBlocked", locale)
                  : t("settings.notifAsk", locale)}
              </span>
              {notifPerm === "default" && (
                <button
                  onClick={() => Notification.requestPermission().then(setNotifPerm)}
                  className="text-xs text-emerald-500 font-bold"
                >
                  {t("settings.enable", locale)}
                </button>
              )}
            </div>
          )}
        </Section>

        {/* Categories (focus tags) */}
        <Section title={t("settings.section.categories", locale)} description={t("settings.section.categories.desc", locale)}>
          <div className="space-y-2">
            {tags.map((tag, idx) => (
              <div key={tag.id} className="flex items-center gap-2">
                <div className="relative">
                  <button className="w-7 h-7 rounded-full border-2 border-card shrink-0" style={{ backgroundColor: tag.color }} />
                  <select
                    value={tag.color}
                    onChange={(e) => {
                      const updated = [...tags];
                      updated[idx] = { ...tag, color: e.target.value };
                      saveTagsList(updated);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    {PALETTE.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <input
                  type="text" value={tag.name}
                  onChange={(e) => {
                    const updated = [...tags];
                    updated[idx] = { ...tag, name: e.target.value };
                    saveTagsList(updated);
                  }}
                  className="flex-1 bg-input border border-input rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
                  maxLength={12}
                />
                <button
                  onClick={() => saveTagsList(tags.filter((_, i) => i !== idx))}
                  className="text-muted hover:text-red-400 transition-colors text-lg px-1"
                  aria-label="Remove tag"
                >×</button>
              </div>
            ))}
            {tags.length < 4 && (
              <button
                onClick={() => {
                  const used = new Set(tags.map((tg) => tg.color));
                  const next = PALETTE.find((c) => !used.has(c)) || PALETTE[0];
                  saveTagsList([...tags, { id: crypto.randomUUID(), name: "", color: next }]);
                }}
                className="w-full py-2 rounded-xl border border-dashed border-card text-xs text-muted hover:opacity-80 transition-opacity"
              >+</button>
            )}
          </div>
        </Section>

        {/* Life Timer */}
        <Section title={t("settings.section.life", locale)} description={t("settings.section.life.desc", locale)}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">
              {lifeConfig
                ? `${lifeConfig.lifeExpectancy}${t("settings.setTo", locale)}`
                : "—"}
            </span>
            <button
              onClick={() => setShowLifeModal(true)}
              className="text-xs text-emerald-500 font-bold"
            >
              {lifeConfig ? t("settings.lifeEdit", locale) : t("settings.lifeSet", locale)}
            </button>
          </div>
        </Section>

        {/* Data */}
        <Section title={t("settings.section.data", locale)} description={t("settings.section.data.desc", locale)}>
          <div className="flex gap-2 mb-2">
            <button onClick={handleExport} className="flex-1 py-2 rounded-lg text-xs font-bold bg-subtle text-muted hover:opacity-80 transition-colors">
              {t("settings.export", locale)}
            </button>
            <button onClick={() => fileRef.current?.click()} className="flex-1 py-2 rounded-lg text-xs font-bold bg-subtle text-muted hover:opacity-80 transition-colors">
              {t("settings.import", locale)}
            </button>
            <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          </div>
          {importMsg && (
            <p className={`text-xs text-center mb-2 ${importMsg.ok ? "text-emerald-500" : "text-red-400"}`}>
              {importMsg.text}
            </p>
          )}
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full text-center text-xs text-red-400/60 hover:text-red-400 py-2 transition-colors"
            >
              {t("settings.clear", locale)}
            </button>
          ) : (
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 text-center">
              <p className="text-xs text-red-400 mb-2">{t("settings.clearConfirm", locale)}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2 rounded-lg text-xs bg-subtle text-muted"
                >×</button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 py-2 rounded-lg text-xs font-bold bg-red-500 text-white"
                >{t("settings.clear", locale)}</button>
              </div>
            </div>
          )}
        </Section>

        {/* About */}
        <Section title={t("settings.section.about", locale)}>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">{t("settings.version", locale)}</span>
            <span className="text-muted">1.0.0</span>
          </div>
          <Link
            href="/guide"
            className="block w-full text-center mt-3 py-2 rounded-lg text-xs bg-subtle text-muted hover:text-emerald-500 transition-colors"
          >
            {t("settings.openGuide", locale)} →
          </Link>
        </Section>

        <p className="text-[10px] text-muted text-center opacity-50 pt-4">
          by CreativeStudio SHOTO. — ensolife.app
        </p>
      </div>

      <LifeConfigModal
        key={`life-${locale}`}
        open={showLifeModal}
        onClose={() => setShowLifeModal(false)}
        onSave={(c) => { saveLifeConfig(c); setLifeConfig(c); setShowLifeModal(false); }}
        config={lifeConfig}
      />
    </main>
  );
}

// ================================================
// Sub-components (settings UI primitives)
// ================================================

function Section({ title, description, right, children }: { title: string; description?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-card border border-card rounded-2xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xs font-bold text-muted uppercase tracking-widest">{title}</h3>
          {description && <p className="text-[11px] text-muted opacity-70 mt-1 leading-relaxed">{description}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted">{label}</p>
      {children}
    </div>
  );
}

function PillGroup({ options, value, onChange, accent = "emerald" }: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  accent?: "emerald" | "amber";
}) {
  const activeBg = accent === "amber" ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            value === o.value
              ? `${activeBg} text-white`
              : "bg-subtle text-muted hover:opacity-80"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (b: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors relative ${value ? "bg-emerald-500" : "bg-subtle"}`}
        aria-pressed={value}
      >
        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${value ? "translate-x-[22px]" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}
