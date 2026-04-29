function GoalsSetupStage({ data, onUpdate, onNext, onBack }) {
  const addGoalTemplate = (goal) => {
    const nextGoals = data.goals.trim() ? `${data.goals.trim()}\n- ${goal}` : `- ${goal}`;
    onUpdate({ goals: nextGoals });
  };

  return (
    <div className="session-stage">
      <h2>Choose outcomes</h2>
      <p className="session-stage__lead">
        Add one to three small outcomes. Short lists are easier to finish.
      </p>

      <label className="field">
        <span className="field__label">Goals</span>
        <textarea
          rows="4"
          placeholder={"Example:\n- Outline the introduction\n- Draft 3 slides for section one"}
          value={data.goals}
          onChange={(event) => onUpdate({ goals: event.target.value })}
        />
      </label>

      <div className="quick-actions" aria-label="Goal examples">
        <button type="button" className="chip-button" onClick={() => addGoalTemplate("Review notes")}>
          Review notes
        </button>
        <button type="button" className="chip-button" onClick={() => addGoalTemplate("Finish draft")}>
          Finish draft
        </button>
        <button type="button" className="chip-button" onClick={() => addGoalTemplate("Practice problems")}>
          Practice problems
        </button>
      </div>

      <div className="session-stage__actions">
        <button type="button" className="ghost" onClick={onBack}>
          Back
        </button>
        <button type="button" onClick={onNext}>
          Next: Timer
        </button>
      </div>
    </div>
  );
}

export default GoalsSetupStage;
