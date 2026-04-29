import { useState } from "react";
import { clearLocalData, formatMinutes, getSettings, saveSettings } from "../lib/localSessions";

function User() {
  const [settings, setSettings] = useState(() => getSettings());
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setSettings(saveSettings(settings));
    setMessage("Preferences saved.");
  };

  const handleClearData = () => {
    if (window.confirm("Delete all Calxy sessions and preferences?")) {
      clearLocalData();
      setSettings(getSettings());
      setMessage("Data cleared.");
    }
  };

  return (
    <section className="page-shell">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Profile</p>
          <h1>Preferences</h1>
          <p className="subhead">Tune the app for your focus routine.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <form className="panel settings-form" onSubmit={handleSubmit}>
          <div className="panel__header">
            <div>
              <p className="eyebrow">Basics</p>
              <h2>Personalize Calxy</h2>
            </div>
          </div>

          <label className="field">
            <span className="field__label">Display name</span>
            <input
              type="text"
              placeholder="Your name"
              value={settings.displayName}
              onChange={(event) => setSettings({ ...settings, displayName: event.target.value })}
            />
          </label>

          <label className="field">
            <span className="field__label">Weekly focus goal</span>
            <input
              type="number"
              min="30"
              step="30"
              value={settings.weeklyGoalMinutes}
              onChange={(event) =>
                setSettings({ ...settings, weeklyGoalMinutes: Number(event.target.value || 0) })
              }
            />
            <span className="field__hint">Current goal: {formatMinutes(settings.weeklyGoalMinutes)}</span>
          </label>

          <div className="session-stage__actions">
            <button type="submit">Save preferences</button>
          </div>

          {message && <p className="form-message">{message}</p>}
        </form>

        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Data</p>
              <h2>Manage sessions</h2>
            </div>
          </div>
          <div className="detail-list">
            <p>Clear all sessions and preferences when you want a fresh start.</p>
          </div>
          <div className="session-stage__actions session-stage__actions--left">
            <button type="button" className="ghost danger" onClick={handleClearData}>
              Clear data
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}

export default User;
