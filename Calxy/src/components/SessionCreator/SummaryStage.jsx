import {
  formatMinutes,
  getBreakCount,
  getSessionBreakMinutes,
  getSessionFocusMinutes,
  getSessionGoals,
  getTotalSessionMinutes,
  normalizeSessionTiming,
} from "../../lib/localSessions";

function SummaryStage({ data, onBack, onDone }) {
  const goalLines = getSessionGoals(data);
  const timing = normalizeSessionTiming(data);
  const breakCount = getBreakCount(data);
  const totalMinutes = getTotalSessionMinutes(data);

  return (
    <div className="session-stage">
      <h2>Review and save</h2>
      <p className="session-stage__lead">Check the session plan before starting.</p>

      <div className="summary-card">
        <div className="summary-row">
          <span>Session name</span>
          <strong>{data.name || "Not set"}</strong>
        </div>

        <div className="summary-row">
          <span>Intent</span>
          <strong>{data.intent || "Not provided"}</strong>
        </div>

        <div className="summary-row">
          <span>Goals</span>
          <ul className="summary-list">
            {goalLines.length === 0 && <p className="muted">No goals added.</p>}
            {goalLines.map((goal, index) => (
              <li key={index}>{goal.replace(/^- /, "")}</li>
            ))}
          </ul>
        </div>

        <div className="summary-row">
          <span>Timing</span>
          <div className="summary-list summary-list--plain">
            <strong>{formatMinutes(totalMinutes)} total</strong>
            <p>
              {formatMinutes(timing.durationMinutes)} focus x {timing.focusRounds} ={" "}
              {formatMinutes(getSessionFocusMinutes(data))}
            </p>
            <p>
              {breakCount} {breakCount === 1 ? "break" : "breaks"} x{" "}
              {formatMinutes(timing.breakMinutes)} = {formatMinutes(getSessionBreakMinutes(data))}
            </p>
          </div>
        </div>

        <div className="summary-row">
          <span>Reward</span>
          <strong>{data.reward || "Add something motivating"}</strong>
        </div>

        {data.notes && (
          <div className="summary-row">
            <span>Notes</span>
            <div className="summary-list">
              <p>{data.notes}</p>
            </div>
          </div>
        )}
      </div>

      <div className="session-stage__actions">
        <button type="button" className="ghost" onClick={onBack}>
          Back
        </button>
        <button type="button" onClick={onDone}>
          Save session
        </button>
      </div>
    </div>
  );
}

export default SummaryStage;
