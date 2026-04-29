function RewardSetupStage({ data, onUpdate, onNext, onBack }) {
  const rewards = ["Short walk", "Coffee break", "Message a friend"];

  return (
    <div className="session-stage">
      <h2>Add a reward</h2>
      <p className="session-stage__lead">Choose something small that helps you close the loop.</p>

      <label className="field">
        <span className="field__label">Reward</span>
        <input
          type="text"
          placeholder="Grab a coffee, take a 10-minute walk..."
          value={data.reward}
          onChange={(event) => onUpdate({ reward: event.target.value })}
        />
      </label>

      <div className="quick-actions" aria-label="Reward examples">
        {rewards.map((reward) => (
          <button
            key={reward}
            type="button"
            className="chip-button"
            onClick={() => onUpdate({ reward })}
          >
            {reward}
          </button>
        ))}
      </div>

      <label className="field">
        <span className="field__label">Notes (optional)</span>
        <textarea
          rows="3"
          placeholder="Any reminders for future you?"
          value={data.notes}
          onChange={(event) => onUpdate({ notes: event.target.value })}
        />
      </label>

      <div className="session-stage__actions">
        <button type="button" className="ghost" onClick={onBack}>
          Back
        </button>
        <button type="button" onClick={onNext}>
          Next: Summary
        </button>
      </div>
    </div>
  );
}

export default RewardSetupStage;
