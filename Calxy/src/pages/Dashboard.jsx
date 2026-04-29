import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  formatDate,
  formatMinutes,
  getBreakCount,
  getSessions,
  getSettings,
  getTotalPlannedMinutes,
  getTotalFocusMinutes,
  getTotalSessionMinutes,
  normalizeSessionTiming,
} from "../lib/localSessions";

function Dashboard() {
  const [sessions, setSessions] = useState(() => getSessions());
  const settings = getSettings();

  useEffect(() => {
    const refreshSessions = () => setSessions(getSessions());

    window.addEventListener("focus", refreshSessions);
    window.addEventListener("storage", refreshSessions);
    return () => {
      window.removeEventListener("focus", refreshSessions);
      window.removeEventListener("storage", refreshSessions);
    };
  }, []);

  const stats = useMemo(() => {
    const totalFocus = getTotalFocusMinutes(sessions);
    const totalPlanned = getTotalPlannedMinutes(sessions);
    const completedCount = sessions.filter((session) => session.status === "done").length;
    const plannedCount = sessions.length - completedCount;

    return {
      totalFocus,
      totalPlanned,
      completedCount,
      plannedCount,
    };
  }, [sessions]);

  const latestSessions = sessions.slice(0, 3);
  const nextSession = sessions.find((session) => session.status !== "done");
  const goalProgress = Math.min(
    100,
    Math.round((stats.totalFocus / Number(settings.weeklyGoalMinutes || 1)) * 100),
  );

  return (
    <section className="page-shell dashboard-page">
      <div className="hero-panel">
        <div>
          <p className="eyebrow">Focus planning</p>
          <h1>{settings.displayName ? `Welcome back, ${settings.displayName}` : "Plan your next focus block"}</h1>
          <p className="subhead">
            Create timed focus rounds, run the session timer, and keep notes beside your work.
          </p>
        </div>
        <Link className="primary-link" to="/create-session">
          Create session
        </Link>
      </div>

      <div className="stat-grid" aria-label="Study summary">
        <article className="stat-card">
          <span>Saved sessions</span>
          <strong>{sessions.length}</strong>
        </article>
        <article className="stat-card">
          <span>Focus planned</span>
          <strong>{formatMinutes(stats.totalFocus)}</strong>
        </article>
        <article className="stat-card">
          <span>Time scheduled</span>
          <strong>{formatMinutes(stats.totalPlanned)}</strong>
        </article>
        <article className="stat-card">
          <span>Completed</span>
          <strong>{stats.completedCount}</strong>
        </article>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Up next</p>
              <h2>{nextSession ? nextSession.name : "No session planned"}</h2>
            </div>
            {nextSession && <span className="status-pill">{nextSession.status}</span>}
          </div>

          {nextSession ? (
            <div className="detail-list">
              <p>{nextSession.intent || "No intent added yet."}</p>
              <p>{formatSessionTiming(nextSession)}</p>
              <p>Saved {formatDate(nextSession.createdAt)}</p>
              <div className="panel-actions">
                <Link className="primary-link" to={`/session/${nextSession.id}`}>
                  Start timer
                </Link>
              </div>
            </div>
          ) : (
            <p className="empty-copy">Create a session to see your next study or work block here.</p>
          )}
        </section>

        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Weekly goal</p>
              <h2>{formatMinutes(stats.totalFocus)} planned</h2>
            </div>
            <span className="status-pill">{goalProgress}%</span>
          </div>
          <div className="progress-bar" aria-label="Weekly focus goal progress">
            <span style={{ width: `${goalProgress}%` }} />
          </div>
          <p className="empty-copy">
            Goal: {formatMinutes(settings.weeklyGoalMinutes)}. Edit it from Profile.
          </p>
        </section>
      </div>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Recent</p>
            <h2>Latest sessions</h2>
          </div>
          <Link className="text-link" to="/sessions-history">
            View all
          </Link>
        </div>

        {latestSessions.length > 0 ? (
          <div className="session-list">
            {latestSessions.map((session) => (
              <article className="session-item" key={session.id}>
                <div>
                  <h3>{session.name}</h3>
                  <p>{formatDate(session.createdAt)} - {formatSessionTiming(session)}</p>
                </div>
                <strong>{formatMinutes(getTotalSessionMinutes(session))}</strong>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-copy">No saved sessions yet.</p>
        )}
      </section>
    </section>
  );
}

function formatSessionTiming(session) {
  const timing = normalizeSessionTiming(session);
  const breakCount = getBreakCount(session);
  return `${formatMinutes(getTotalSessionMinutes(session))} total: ${formatMinutes(
    timing.durationMinutes,
  )} focus x ${timing.focusRounds}, ${breakCount} ${breakCount === 1 ? "break" : "breaks"}`;
}

export default Dashboard;
