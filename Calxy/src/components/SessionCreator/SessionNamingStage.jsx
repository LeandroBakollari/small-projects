function SessionNamingStage({ data, onUpdate, onNext }) {
  const hasName = data.name.trim().length > 0;

  return (
    <div className="session-stage">
      <h2>Name the session</h2>
      <p className="session-stage__lead">
        Give this focus block a clear name so it is easy to find later.
      </p>

      <label className="field">
        <span className="field__label">Session name</span>
        <input
          autoFocus
          type="text"
          placeholder="Example: Biology exam review"
          value={data.name}
          onChange={(event) => onUpdate({ name: event.target.value })}
        />
      </label>

      <label className="field">
        <span className="field__label">Main intent</span>
        <textarea
          rows="3"
          placeholder="What should be true when this session is done?"
          value={data.intent}
          onChange={(event) => onUpdate({ intent: event.target.value })}
        />
      </label>

      <div className="session-stage__actions">
        <button type="button" disabled={!hasName} onClick={onNext}>
          Next: Goals
        </button>
      </div>
    </div>
  );
}

export default SessionNamingStage;
