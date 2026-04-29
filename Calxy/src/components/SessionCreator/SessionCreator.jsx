import { useState } from "react";
import SessionNamingStage from "./SessionNamingStage";
import GoalsSetupStage from "./GoalsSetupStage";
import TimerSetupStage from "./TimerSetupStage";
import RewardSetupStage from "./RewardSetupStage";
import SummaryStage from "./SummaryStage";
import { saveSession } from "../../lib/localSessions";
import { Link } from "react-router-dom";

const STAGES = [
  { key: "naming", label: "Name", component: SessionNamingStage },
  { key: "goals", label: "Goals", component: GoalsSetupStage },
  { key: "timer", label: "Timer", component: TimerSetupStage },
  { key: "reward", label: "Reward", component: RewardSetupStage },
  { key: "summary", label: "Summary", component: SummaryStage },
];

function SessionCreator() {
  const [currentStage, setCurrentStage] = useState(0);
  const [sessionData, setSessionData] = useState({
    name: "",
    intent: "",
    goals: "",
    durationMinutes: 25,
    breakMinutes: 5,
    focusRounds: 3,
    reward: "",
    notes: "",
  });
  const [doneMessage, setDoneMessage] = useState("");
  const [savedSessionId, setSavedSessionId] = useState("");

  const ActiveStage = STAGES[currentStage].component;

  const handleUpdate = (partial) => {
    setSessionData((prev) => ({ ...prev, ...partial }));
  };

  const goNext = () => {
    setDoneMessage("");
    setCurrentStage((stage) => Math.min(stage + 1, STAGES.length - 1));
  };

  const goBack = () => {
    setDoneMessage("");
    setCurrentStage((stage) => Math.max(stage - 1, 0));
  };

  const handleDone = () => {
    if (savedSessionId) {
      setDoneMessage("Already saved. Create another session when you are ready.");
      return;
    }

    const savedSession = saveSession(sessionData);
    setSavedSessionId(savedSession.id);
    setDoneMessage("Saved. You can start the timer now or find it in History.");
  };

  const resetCreator = () => {
    setCurrentStage(0);
    setSessionData({
      name: "",
      intent: "",
      goals: "",
      durationMinutes: 25,
      breakMinutes: 5,
      focusRounds: 3,
      reward: "",
      notes: "",
    });
    setDoneMessage("");
    setSavedSessionId("");
  };

  return (
    <section className="session-creator page-shell">
      <header className="session-creator__header">
        <p className="eyebrow">Session setup</p>
        <h1>Create a focused session</h1>
        <p className="subhead">Plan a study or work block in five quick steps.</p>

        <div className="session-creator__progress">
          {STAGES.map((stage, index) => (
            <div
              key={stage.key}
              className={`session-creator__progress-step ${index === currentStage ? "active" : ""} ${
                index < currentStage ? "complete" : ""
              }`}
            >
              <span className="session-creator__progress-dot" />
              <span className="session-creator__progress-label">{stage.label}</span>
            </div>
          ))}
        </div>
      </header>

      <div className="session-creator__card">
        <ActiveStage
          data={sessionData}
          onUpdate={handleUpdate}
          onNext={currentStage < STAGES.length - 1 ? goNext : null}
          onBack={currentStage > 0 ? goBack : null}
          onDone={handleDone}
          isLast={currentStage === STAGES.length - 1}
        />

        {doneMessage && currentStage === STAGES.length - 1 && (
          <div className="session-creator__toast" role="status">
            <p>{doneMessage}</p>
            {savedSessionId && (
              <div className="toast-actions">
                <Link className="primary-link" to={`/session/${savedSessionId}`}>
                  Start timer
                </Link>
                <button type="button" className="ghost" onClick={resetCreator}>
                  Create another
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default SessionCreator;
