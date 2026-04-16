import { TimeRemaining } from "@/types";

export function calcTimeRemaining(targetDate: string): TimeRemaining {
  const now = Date.now();
  const target = new Date(targetDate).getTime();
  const diff = target - now;
  const isPast = diff < 0;
  const abs = Math.abs(diff);

  const totalSeconds = Math.floor(abs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    total: totalSeconds,
    days,
    hours,
    minutes,
    seconds,
    isPast,
  };
}

export function calcLifeDeadline(birthDate: string, lifeExpectancy: number): string {
  const birth = new Date(birthDate);
  const deadline = new Date(birth);
  deadline.setFullYear(deadline.getFullYear() + lifeExpectancy);
  return deadline.toISOString();
}

export function calcLifeProgress(birthDate: string, lifeExpectancy: number): number {
  const birth = new Date(birthDate).getTime();
  const deadline = new Date(birthDate);
  deadline.setFullYear(deadline.getFullYear() + lifeExpectancy);
  const total = deadline.getTime() - birth;
  const elapsed = Date.now() - birth;
  return Math.min(Math.max((elapsed / total) * 100, 0), 100);
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function formatRelativeDate(dateStr: string): string {
  const target = new Date(dateStr);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    if (absDays === 0) return "Today";
    if (absDays === 1) return "Yesterday";
    if (absDays < 30) return `${absDays}d ago`;
    return target.toLocaleDateString();
  }
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `${diffDays}d`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}w ${diffDays % 7 > 0 ? `${diffDays % 7}d` : ""}`.trim();
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months}mo`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years}y ${Math.floor((diffDays % 365) / 30)}mo`;
}
