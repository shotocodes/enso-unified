export const APPS = [
  {
    name: "TIMER",
    taglineKey: "app.timer",
    href: "/timer",
    logo: (
      <>
        <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.9" />
        <circle cx="50" cy="18" r="5" fill="currentColor" className="animate-timer-hand" />
      </>
    ),
  },
  {
    name: "TASK",
    taglineKey: "app.task",
    href: "/task",
    logo: (
      <>
        <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.9" />
        <polyline points="40,50 48,58 62,42" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" className="animate-task-check" />
      </>
    ),
  },
  {
    name: "FOCUS",
    taglineKey: "app.focus",
    href: "/focus",
    logo: (
      <>
        <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.9" />
        <circle cx="50" cy="50" r="5" fill="currentColor" className="animate-focus-pulse" />
      </>
    ),
  },
  {
    name: "JOURNAL",
    taglineKey: "app.journal",
    href: "/journal",
    logo: (
      <>
        <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.9" />
        <line x1="38" y1="42" x2="62" y2="42" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="animate-journal-line-1" />
        <line x1="38" y1="50" x2="62" y2="50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="animate-journal-line-2" />
        <line x1="38" y1="58" x2="62" y2="58" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="animate-journal-line-3" />
      </>
    ),
  },
];
