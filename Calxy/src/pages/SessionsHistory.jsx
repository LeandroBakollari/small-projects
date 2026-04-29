import { useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteSession,
  formatDate,
  formatMinutes,
  getBreakCount,
  getSessionGoals,
  getSessions,
  getTotalSessionMinutes,
  normalizeSessionTiming,
  updateSession,
} from "../lib/localSessions";

function SessionsHistory() {
  const [sessions, setSessions] = useState(() => getSessions());

  const handleStatusChange = (id, status) => {
    setSessions(updateSession(id, { status }));
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this session?")) {
      setSessions(deleteSession(id));
    }
  };

  return (
    <section className="page-shell">
      <div className="page-heading">
        <div>
          <p className="eyebrow">History</p>
          <h1>Sessions</h1>
          <p className="subhead">Review planned, completed, and skipped focus sessions.</p>
        </div>
        <Link className="primary-link" to="/create-session">
          New session
        </Link>
      </div>

      {sessions.length === 0 ? (
        <section className="empty-state">
          <h2>No sessions saved</h2>
          <p>Start with a simple plan and it will appear here automatically.</p>
          <Link className="primary-link" to="/create-session">
            Create session
          </Link>
        </section>
      ) : (
        <div className="session-list history-list">
          {sessions.map((session) => {
            const goals = getSessionGoals(session);

            return (
              <article className="session-item session-item--expanded" key={session.id}>
                <div className="session-item__main">
                  <div>
                    <p className="eyebrow">{formatDate(session.createdAt)}</p>
                    <h2>{session.name}</h2>
                    <p>{session.intent || "No intent added."}</p>
                  </div>

                  {goals.length > 0 && (
                    <ul className="compact-list">
                      {goals.slice(0, 3).map((goal, index) => (
                        <li key={index}>{goal.replace(/^- /, "")}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="session-item__meta">
                  <strong>{formatMinutes(getTotalSessionMinutes(session))}</strong>
                  <span className="field__hint">{formatSessionTiming(session)}</span>
                  <Link className="primary-link" to={`/session/${session.id}`}>
                    Timer
                  </Link>
                  <select
                    aria-label={`Status for ${session.name}`}
                    value={session.status || "planned"}
                    onChange={(event) => handleStatusChange(session.id, event.target.value)}
                  >
                    <option value="planned">Planned</option>
                    <option value="done">Done</option>
                    <option value="skipped">Skipped</option>
                  </select>
                  <button type="button" className="ghost danger" onClick={() => handleDelete(session.id)}>
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function formatSessionTiming(session) {
  const timing = normalizeSessionTiming(session);
  const breakCount = getBreakCount(session);
  return `${formatMinutes(timing.durationMinutes)} x ${timing.focusRounds}, ${breakCount} ${
    breakCount === 1 ? "break" : "breaks"
  }`;
}

export default SessionsHistory;
