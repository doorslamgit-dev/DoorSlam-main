// src/utils/dateUtils.ts

export function todayIsoDate(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

export function tomorrowIsoDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function formatDateLong(isoDate: string): string {
  const date = new Date(isoDate + "T12:00:00");
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function formatDateShort(isoDate: string): string {
  const date = new Date(isoDate + "T12:00:00");
  const today = todayIsoDate();
  const tomorrow = tomorrowIsoDate();
  
  if (isoDate === today) return "Today";
  if (isoDate === tomorrow) return "Tomorrow";
  
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export function getPatternLabel(pattern: string): string {
  switch (pattern) {
    case "SINGLE_20": return "Quick session";
    case "DOUBLE_45": return "Standard session";
    case "TRIPLE_70": return "Deep dive";
    default: return "Session";
  }
}

// Subject visual helpers
const subjectIcons: Record<string, string> = {
  chemistry: "🧪",
  mathematics: "🔢",
  maths: "🔢",
  "english literature": "📚",
  english: "📚",
  physics: "⚛️",
  biology: "🧬",
  history: "📜",
  geography: "🌍",
  "religious studies": "🕊️",
  "computer science": "💻",
};

const subjectColors: Record<string, string> = {
  chemistry: "bg-emerald-100 text-emerald-700",
  physics: "bg-info-bg text-info",
  biology: "bg-success-bg text-success",
  mathematics: "bg-primary-100 text-primary-700",
  maths: "bg-primary-100 text-primary-700",
  english: "bg-warning-bg text-warning",
  "english literature": "bg-warning-bg text-warning",
  history: "bg-orange-100 text-orange-700",
  geography: "bg-teal-100 text-teal-700",
  "religious studies": "bg-primary-100 text-primary-700",
  "computer science": "bg-neutral-100 text-neutral-700",
};

export function getSubjectIcon(subjectName: string | null): string {
  const key = (subjectName || "").toLowerCase();
  return subjectIcons[key] || "📖";
}

export function getSubjectColorClass(subjectName: string | null): string {
  const key = (subjectName || "").toLowerCase();
  return subjectColors[key] || "bg-neutral-100 text-neutral-700";
}