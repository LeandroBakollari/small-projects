const SESSIONS_KEY = "calxy.sessions";
const SETTINGS_KEY = "calxy.settings";

const defaultSettings = {
  displayName: "",
  weeklyGoalMinutes: 300,
};

function readJson(key, fallback) {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function makeId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toWholeNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : fallback;
}

export function normalizeSessionTiming(session = {}) {
  const durationMinutes = Math.max(1, toWholeNumber(session.durationMinutes, 25));
  const breakMinutes = Math.max(0, toWholeNumber(session.breakMinutes, 5));
  const focusRounds = Math.max(1, toWholeNumber(session.focusRounds, 1));

  return {
    durationMinutes,
    breakMinutes,
    focusRounds,
  };
}

export function getSessions() {
  const sessions = readJson(SESSIONS_KEY, []);
  return Array.isArray(sessions) ? sessions : [];
}

export function getSession(id) {
  return getSessions().find((session) => session.id === id) || null;
}

export function saveSession(session) {
  const savedSession = {
    id: makeId(),
    createdAt: new Date().toISOString(),
    status: "planned",
    ...session,
    ...normalizeSessionTiming(session),
  };

  writeJson(SESSIONS_KEY, [savedSession, ...getSessions()]);
  return savedSession;
}

export function updateSession(id, updates) {
  const sessions = getSessions().map((session) =>
    session.id === id ? { ...session, ...updates } : session,
  );
  writeJson(SESSIONS_KEY, sessions);
  return sessions;
}

export function deleteSession(id) {
  const sessions = getSessions().filter((session) => session.id !== id);
  writeJson(SESSIONS_KEY, sessions);
  return sessions;
}

export function getSettings() {
  const settings = readJson(SETTINGS_KEY, defaultSettings);
  return { ...defaultSettings, ...settings };
}

export function saveSettings(settings) {
  const nextSettings = { ...defaultSettings, ...settings };
  writeJson(SETTINGS_KEY, nextSettings);
  return nextSettings;
}

export function clearLocalData() {
  window.localStorage.removeItem(SESSIONS_KEY);
  window.localStorage.removeItem(SETTINGS_KEY);
}

export function getSessionGoals(session) {
  return (session.goals || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function getBreakCount(session) {
  const { focusRounds, breakMinutes } = normalizeSessionTiming(session);
  return breakMinutes > 0 ? Math.max(0, focusRounds - 1) : 0;
}

export function getSessionFocusMinutes(session) {
  const { durationMinutes, focusRounds } = normalizeSessionTiming(session);
  return durationMinutes * focusRounds;
}

export function getSessionBreakMinutes(session) {
  const { breakMinutes } = normalizeSessionTiming(session);
  return breakMinutes * getBreakCount(session);
}

export function getTotalSessionMinutes(session) {
  return getSessionFocusMinutes(session) + getSessionBreakMinutes(session);
}

export function getTotalFocusMinutes(sessions) {
  return sessions.reduce((total, session) => total + getSessionFocusMinutes(session), 0);
}

export function getTotalPlannedMinutes(sessions) {
  return sessions.reduce((total, session) => total + getTotalSessionMinutes(session), 0);
}

export function formatMinutes(minutes) {
  const safeMinutes = Math.max(0, toWholeNumber(minutes, 0));

  if (safeMinutes < 60) {
    return `${safeMinutes} min`;
  }

  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function formatDate(value) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
