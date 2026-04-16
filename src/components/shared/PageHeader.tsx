"use client";

import Link from "next/link";
import EnsoLogo from "./EnsoLogo";
import { SettingsIcon } from "./Icons";

interface Props {
  title: string;
  subtitle?: string;
  /** Hide the settings gear (e.g. on the settings page itself). */
  hideSettings?: boolean;
  /** Optional extra slot on the right, rendered before the settings gear. */
  right?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, hideSettings, right }: Props) {
  return (
    <header className="w-full flex items-center justify-between mb-6">
      <Link href="/dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity" aria-label="ENSO Dashboard">
        <EnsoLogo size={28} className="text-emerald-500" />
        <div className="min-w-0">
          <p className="text-base font-bold tracking-tight leading-tight truncate">{title}</p>
          {subtitle && <p className="text-[10px] text-muted leading-tight truncate">{subtitle}</p>}
        </div>
      </Link>
      <div className="flex items-center gap-1.5">
        {right}
        {!hideSettings && (
          <Link
            href="/settings"
            className="w-9 h-9 rounded-xl bg-card border border-card flex items-center justify-center text-muted hover:text-emerald-500 hover:border-emerald-500/30 transition-all"
            aria-label="Settings"
          >
            <SettingsIcon size={16} />
          </Link>
        )}
      </div>
    </header>
  );
}
