import {
  formatMinutes,
  getBreakCount,
  getSessionBreakMinutes,
  getSessionFocusMinutes,
  getTotalSessionMinutes,
  normalizeSessionTiming,
} from "../../lib/localSessions";

const PRESETS = [
  { label: "25 / 5 x 3", durationMinutes: 25, breakMinutes: 5, focusRounds: 3 },
  { label: "45 / 10 x 3", durationMinutes: 45, breakMinutes: 10, focusRounds: 3 },
  { label: "60 / 15 x 2", durationMinutes: 60, breakMinutes: 15, focusRounds: 2 },
];

function TimerSetupStage({ data, onUpdate, onNext, onBack }) {
  const timing = normalizeSessionTiming(data);
  const breakCount = getBreakCount(data);
  const focusMinutes = getSessionFocusMinutes(data);
  const totalBreakMinutes = getSessionBreakMinutes(data);
  const totalMinutes = getTotalSessionMinutes(data);

  const updateNumber = (field) => (event) => {
    const parsed = Number(event.target.value);
    onUpdate({ [field]: Number.isNaN(parsed) ? 0 : parsed });
  };

  return (
    <div className="session-stage">
      <h2>Timing</h2>
      <p className="session-stage__lead">Pick a focus length that feels realistic today.</p>

      <div className="preset-grid" aria-label="Session timing presets">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className={`preset-button${
              timing.durationMinutes === preset.durationMinutes &&
              timing.breakMinutes === preset.breakMinutes &&
              timing.focusRounds === preset.focusRounds
                ? " active"
                : ""
            }`}
            onClick={() => onUpdate(preset)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="field-grid">
        <label className="field">
          <span className="field__label">Focus minutes</span>
          <input
            type="number"
            min="5"
            step="5"
            value={data.durationMinutes}
            onChange={updateNumber("durationMinutes")}
          />
        </label>

        <label className="field">
          <span className="field__label">Break minutes</span>
          <input
            type="number"
            min="3"
            step="1"
            value={data.breakMinutes}
            onChange={updateNumber("breakMinutes")}
          />
        </label>

        <label className="field">
          <span className="field__label">Focus rounds</span>
          <input
            type="number"
            min="1"
            step="1"
            value={data.focusRounds}
            onChange={updateNumber("focusRounds")}
          />
        </label>
      </div>

      <div className="timing-total" aria-label="Total session time">
        <div>
          <span>Total session</span>
          <strong>{formatMinutes(totalMinutes)}</strong>
        </div>
        <p>
          {formatMinutes(focusMinutes)} focus + {formatMinutes(totalBreakMinutes)} break across{" "}
          {timing.focusRounds} focus {timing.focusRounds === 1 ? "round" : "rounds"} and {breakCount}{" "}
          {breakCount === 1 ? "break" : "breaks"}.
        </p>
      </div>

      <div className="session-stage__actions">
        <button type="button" className="ghost" onClick={onBack}>
          Back
        </button>
        <button type="button" onClick={onNext}>
          Next: Reward
        </button>
      </div>
    </div>
  );
}

export default TimerSetupStage;
