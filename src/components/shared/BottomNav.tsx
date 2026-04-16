"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t, type Locale } from "@/lib/i18n";
import type { PageId } from "@/types";

interface Props {
  locale: Locale;
}

interface NavItem {
  id: PageId;
  href: string;
  labelKey: string;
  logo: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "timer",
    href: "/timer",
    labelKey: "nav.timer",
    logo: (
      <>
        <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.9" />
        <circle cx="50" cy="18" r="5" fill="currentColor" />
      </>
    ),
  },
  {
    id: "task",
    href: "/task",
    labelKey: "nav.task",
    logo: (
      <>
        <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.9" />
        <polyline points="40,50 48,58 62,42" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    id: "dashboard",
    href: "/dashboard",
    labelKey: "nav.dashboard",
    logo: (
      <>
        <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.95" />
      </>
    ),
  },
  {
    id: "focus",
    href: "/focus",
    labelKey: "nav.focus",
    logo: (
      <>
        <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.9" />
        <circle cx="50" cy="50" r="5" fill="currentColor" />
      </>
    ),
  },
  {
    id: "journal",
    href: "/journal",
    labelKey: "nav.journal",
    logo: (
      <>
        <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.9" />
        <line x1="38" y1="42" x2="62" y2="42" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
        <line x1="38" y1="50" x2="62" y2="50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.65" />
        <line x1="38" y1="58" x2="62" y2="58" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="1" />
      </>
    ),
  },
];

export default function BottomNav({ locale }: Props) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-tab-bar backdrop-blur-xl border-t border-card"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <div className="max-w-lg mx-auto flex items-stretch justify-between">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={t(item.labelKey, locale)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors focus:outline-none"
            >
              <svg
                width={24}
                height={24}
                viewBox="0 0 100 100"
                fill="none"
                className={active ? "text-emerald-500" : "text-muted"}
              >
                {item.logo}
              </svg>
              <span
                className={`text-[10px] font-medium ${active ? "text-emerald-500" : "text-muted"}`}
              >
                {t(item.labelKey, locale)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
