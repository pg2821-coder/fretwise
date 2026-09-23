export type SessionRecord = {
  /** stable id so a session is never stored twice in an account */
  id?: string;
  /** local calendar day, YYYY-MM-DD */
  date: string;
  minutes: number;
  lessonId: string;
  /** 0–100 */
  accuracy: number;
};

export const newSessionId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export type Progress = {
  completedLessons: string[];
  sessions: SessionRecord[];
  xp: number;
  streak: number;
};

export const STORAGE_KEY = "fretwise-progress";

export const EMPTY_PROGRESS: Progress = { completedLessons: [], sessions: [], xp: 0, streak: 0 };

export const DAILY_GOAL = 15;

export const dayKey = (d: Date = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const shiftDays = (key: string, delta: number) => {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y!, (m ?? 1) - 1, d ?? 1);
  date.setDate(date.getDate() + delta);
  return dayKey(date);
};

export function loadProgress(): Progress {
  if (typeof window === "undefined") return EMPTY_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      xp: typeof parsed.xp === "number" ? parsed.xp : 0,
      streak: typeof parsed.streak === "number" ? parsed.streak : 0,
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(p: Progress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable — progress stays in memory for this visit */
  }
}

/** Consecutive calendar days with at least one session, counted back from today or yesterday. */
export function computeStreak(sessions: SessionRecord[], today = dayKey()): number {
  const days = new Set(sessions.map((s) => s.date));
  if (days.size === 0) return 0;
  let cursor = days.has(today) ? today : shiftDays(today, -1);
  if (!days.has(cursor)) return 0;
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = shiftDays(cursor, -1);
  }
  return streak;
}

export const minutesOn = (sessions: SessionRecord[], date = dayKey()) =>
  sessions.filter((s) => s.date === date).reduce((sum, s) => sum + s.minutes, 0);

export const levelFor = (xp: number) => Math.floor(xp / 500) + 1;

const LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Monday-to-Sunday strip for the current week, marked from stored session dates. */
export function weekStrip(sessions: SessionRecord[], today = dayKey()): { day: string; done: boolean }[] {
  const days = new Set(sessions.map((s) => s.date));
  const [y, m, d] = today.split("-").map(Number);
  const date = new Date(y!, (m ?? 1) - 1, d ?? 1);
  const mondayOffset = (date.getDay() + 6) % 7;
  const monday = shiftDays(today, -mondayOffset);
  return LABELS.map((day, i) => ({ day, done: days.has(shiftDays(monday, i)) }));
}

export function clearProgress() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
}

export const hasAnyProgress = (p: Progress) =>
  p.completedLessons.length > 0 || p.sessions.length > 0 || p.xp > 0 || p.streak > 0;

/** Union of drills and sessions, highest XP, streak recomputed from the combined dates. */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const completedLessons = Array.from(new Set([...a.completedLessons, ...b.completedLessons]));
  const byId = new Map<string, SessionRecord>();
  for (const s of [...a.sessions, ...b.sessions]) {
    const id = s.id ?? newSessionId();
    if (!byId.has(id)) byId.set(id, { ...s, id });
  }
  const sessions = Array.from(byId.values());
  return { completedLessons, sessions, xp: Math.max(a.xp, b.xp), streak: computeStreak(sessions) };
}
