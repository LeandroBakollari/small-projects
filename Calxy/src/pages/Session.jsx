import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  formatMinutes,
  getSession,
  getTotalSessionMinutes,
  normalizeSessionTiming,
  updateSession,
} from "../lib/localSessions";

const MAX_NOTE_IMAGE_MB = 5;
const MAX_NOTE_IMAGE_BYTES = MAX_NOTE_IMAGE_MB * 1024 * 1024;

const emptyTimerState = {
  segmentIndex: 0,
  segmentRemainingSeconds: 0,
  isRunning: false,
  isComplete: false,
};

function makeClientId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createNote(partial = {}) {
  return {
    id: makeClientId(),
    text: "",
    link: "",
    image: null,
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

function getInitialNotes(session) {
  if (!session) {
    return [];
  }

  if (Array.isArray(session.timerNotes)) {
    return session.timerNotes.map((note) =>
      createNote({
        ...note,
        id: note.id || makeClientId(),
        text: note.text || "",
        link: note.link || "",
        image: note.image || null,
        createdAt: note.createdAt || new Date().toISOString(),
      }),
    );
  }

  if (session.notes?.trim()) {
    return [createNote({ text: session.notes.trim() })];
  }

  return [];
}

function buildSessionSegments(session) {
  if (!session) {
    return [];
  }

  const timing = normalizeSessionTiming(session);
  const segments = [];

  for (let roundIndex = 0; roundIndex < timing.focusRounds; roundIndex += 1) {
    segments.push({
      type: "focus",
      label: `Focus ${roundIndex + 1}/${timing.focusRounds}`,
      durationSeconds: timing.durationMinutes * 60,
    });

    if (roundIndex < timing.focusRounds - 1 && timing.breakMinutes > 0) {
      segments.push({
        type: "break",
        label: `Break ${roundIndex + 1}/${timing.focusRounds - 1}`,
        durationSeconds: timing.breakMinutes * 60,
      });
    }
  }

  return segments;
}

function sumSegmentSeconds(segments) {
  return segments.reduce((total, segment) => total + segment.durationSeconds, 0);
}

function formatClock(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  const paddedMinutes = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
  const paddedSeconds = String(seconds).padStart(2, "0");

  return hours > 0 ? `${hours}:${paddedMinutes}:${paddedSeconds}` : `${paddedMinutes}:${paddedSeconds}`;
}

function normalizeLink(value) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  try {
    return new URL(trimmed).href;
  } catch {
    try {
      return new URL(`https://${trimmed}`).href;
    } catch {
      return "";
    }
  }
}

function formatImageSize(bytes) {
  if (!bytes) {
    return "";
  }

  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

function Session() {
  const { sessionId } = useParams();
  const loadedSession = getSession(sessionId);
  const loadedSegments = buildSessionSegments(loadedSession);
  const [session] = useState(loadedSession);
  const [notes, setNotes] = useState(() => getInitialNotes(loadedSession));
  const [noteMessage, setNoteMessage] = useState("");
  const [isCompact, setIsCompact] = useState(false);
  const [timerState, setTimerState] = useState(() => ({
    ...emptyTimerState,
    segmentRemainingSeconds: loadedSegments[0]?.durationSeconds || 0,
  }));
  const completionSavedRef = useRef(false);

  const timing = useMemo(() => normalizeSessionTiming(session || {}), [session]);
  const segments = useMemo(() => buildSessionSegments(session), [session]);
  const totalSeconds = useMemo(() => sumSegmentSeconds(segments), [segments]);
  const currentSegment = segments[timerState.segmentIndex] || null;
  const currentSegmentRemaining = timerState.isComplete ? 0 : timerState.segmentRemainingSeconds;

  const totalRemainingSeconds = useMemo(() => {
    if (timerState.isComplete || !currentSegment) {
      return 0;
    }

    const completedBeforeCurrent = sumSegmentSeconds(segments.slice(0, timerState.segmentIndex));
    const elapsedCurrent = Math.max(0, currentSegment.durationSeconds - timerState.segmentRemainingSeconds);

    return Math.max(0, totalSeconds - completedBeforeCurrent - elapsedCurrent);
  }, [currentSegment, segments, timerState, totalSeconds]);

  const progressPercent = totalSeconds
    ? Math.min(100, Math.round(((totalSeconds - totalRemainingSeconds) / totalSeconds) * 100))
    : 0;

  useEffect(() => {
    if (!timerState.isRunning || timerState.isComplete || segments.length === 0) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setTimerState((state) => {
        if (!state.isRunning || state.isComplete) {
          return state;
        }

        if (state.segmentRemainingSeconds > 1) {
          return {
            ...state,
            segmentRemainingSeconds: state.segmentRemainingSeconds - 1,
          };
        }

        const nextSegmentIndex = state.segmentIndex + 1;

        if (nextSegmentIndex >= segments.length) {
          return {
            ...state,
            segmentRemainingSeconds: 0,
            isRunning: false,
            isComplete: true,
          };
        }

        return {
          ...state,
          segmentIndex: nextSegmentIndex,
          segmentRemainingSeconds: segments[nextSegmentIndex].durationSeconds,
        };
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [segments, timerState.isComplete, timerState.isRunning]);

  useEffect(() => {
    if (!session || !timerState.isComplete || completionSavedRef.current) {
      return;
    }

    const completedAt = new Date().toISOString();
    updateSession(session.id, { status: "done", completedAt });
    completionSavedRef.current = true;
  }, [session, timerState.isComplete]);

  const resetTimer = useCallback(() => {
    setTimerState({
      ...emptyTimerState,
      segmentRemainingSeconds: segments[0]?.durationSeconds || 0,
    });
    completionSavedRef.current = false;
  }, [segments]);

  const toggleTimer = () => {
    if (timerState.isComplete) {
      setTimerState({
        ...emptyTimerState,
        isRunning: true,
        segmentRemainingSeconds: segments[0]?.durationSeconds || 0,
      });
      completionSavedRef.current = false;
      return;
    }

    setTimerState((state) => ({ ...state, isRunning: !state.isRunning }));
  };

  const skipSegment = () => {
    setTimerState((state) => {
      const nextSegmentIndex = state.segmentIndex + 1;

      if (nextSegmentIndex >= segments.length) {
        return {
          ...state,
          segmentRemainingSeconds: 0,
          isRunning: false,
          isComplete: true,
        };
      }

      return {
        ...state,
        segmentIndex: nextSegmentIndex,
        segmentRemainingSeconds: segments[nextSegmentIndex].durationSeconds,
      };
    });
  };

  const persistNotes = useCallback(
    (nextNotes) => {
      setNotes(nextNotes);

      if (session) {
        updateSession(session.id, { timerNotes: nextNotes });
      }
    },
    [session],
  );

  const addNote = () => {
    setNoteMessage("");
    persistNotes([...notes, createNote()]);
  };

  const updateNote = (noteId, updates) => {
    setNoteMessage("");
    persistNotes(notes.map((note) => (note.id === noteId ? { ...note, ...updates } : note)));
  };

  const removeNote = (noteId) => {
    persistNotes(notes.filter((note) => note.id !== noteId));
  };

  const readImageFile = (noteId, file) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setNoteMessage("Only image files can be attached.");
      return;
    }

    if (file.size > MAX_NOTE_IMAGE_BYTES) {
      setNoteMessage(`Images must be ${MAX_NOTE_IMAGE_MB} MB or smaller.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateNote(noteId, {
        image: {
          name: file.name,
          size: file.size,
          dataUrl: reader.result,
        },
      });
      setNoteMessage("");
    };
    reader.readAsDataURL(file);
  };

  if (!session) {
    return (
      <section className="page-shell">
        <div className="empty-state">
          <h1>Session not found</h1>
          <p>Choose an existing session or create a new focus plan.</p>
          <Link className="primary-link" to="/sessions-history">
            View sessions
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={`session-runtime page-shell${isCompact ? " session-runtime--compact" : ""}`}>
      <div className="session-toolbar">
        <Link className="text-link" to="/sessions-history">
          Back to sessions
        </Link>
        <button type="button" className="ghost" onClick={() => setIsCompact((value) => !value)}>
          {isCompact ? "Center timer" : "Top-left timer"}
        </button>
      </div>

      <div className="session-workspace">
        <section className="timer-panel" aria-label="Session timer">
          <div className="timer-card">
            <div className="timer-card__header">
              <div>
                <p className="eyebrow">{timerState.isComplete ? "Complete" : currentSegment?.type || "Focus"}</p>
                <h1>{session.name}</h1>
              </div>
              <span className={`status-pill timer-status timer-status--${currentSegment?.type || "focus"}`}>
                {timerState.isComplete ? "Finished" : currentSegment?.label || "Ready"}
              </span>
            </div>

            <div className="timer-readout" aria-live="polite">
              <strong>{formatClock(currentSegmentRemaining)}</strong>
              <span>{timerState.isComplete ? "session finished" : `left in ${currentSegment?.type || "focus"}`}</span>
            </div>

            <div className="timer-total">
              <span>Total left</span>
              <strong>{formatClock(totalRemainingSeconds)}</strong>
            </div>

            <div className="progress-bar timer-progress" aria-label="Session progress">
              <span style={{ width: `${progressPercent}%` }} />
            </div>

            <div className="timer-controls">
              <button type="button" onClick={toggleTimer} disabled={segments.length === 0}>
                {timerState.isComplete ? "Restart" : timerState.isRunning ? "Pause" : "Start"}
              </button>
              <button type="button" className="ghost" onClick={skipSegment} disabled={timerState.isComplete}>
                Skip
              </button>
              <button type="button" className="ghost" onClick={resetTimer}>
                Reset
              </button>
            </div>

            <p className="timer-meta">
              {formatMinutes(getTotalSessionMinutes(session))} total: {formatMinutes(timing.durationMinutes)} focus x{" "}
              {timing.focusRounds}, {Math.max(0, timing.focusRounds - 1)} breaks.
            </p>
          </div>
        </section>

        <section className="notes-panel" aria-labelledby="session-notes-title">
          <div className="notes-header">
            <div>
              <p className="eyebrow">Notes</p>
              <h2 id="session-notes-title">Session notes</h2>
            </div>
            <button type="button" onClick={addNote}>
              Add note
            </button>
          </div>

          {noteMessage && <p className="note-message">{noteMessage}</p>}

          {notes.length === 0 ? (
            <div className="empty-note-state">
              <p>No notes yet.</p>
              <button type="button" className="ghost" onClick={addNote}>
                Add first note
              </button>
            </div>
          ) : (
            <div className="note-grid">
              {notes.map((note, index) => {
                const linkHref = normalizeLink(note.link || "");

                return (
                  <article className="note-card" key={note.id}>
                    <div className="note-card__top">
                      <strong>Note {index + 1}</strong>
                      <button type="button" className="ghost danger" onClick={() => removeNote(note.id)}>
                        Delete
                      </button>
                    </div>

                    <textarea
                      aria-label={`Text for note ${index + 1}`}
                      rows="6"
                      placeholder="Write a note..."
                      value={note.text}
                      onChange={(event) => updateNote(note.id, { text: event.target.value })}
                    />

                    <label className="field note-link-field">
                      <span className="field__label">Link</span>
                      <input
                        type="url"
                        placeholder="https://example.com"
                        value={note.link}
                        onChange={(event) => updateNote(note.id, { link: event.target.value })}
                      />
                    </label>

                    {linkHref && (
                      <a className="note-link-preview" href={linkHref} target="_blank" rel="noreferrer">
                        Open link
                      </a>
                    )}

                    <div
                      className="note-drop-zone"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        readImageFile(note.id, event.dataTransfer.files?.[0]);
                      }}
                    >
                      <input
                        id={`note-image-${note.id}`}
                        type="file"
                        accept="image/*"
                        onChange={(event) => readImageFile(note.id, event.target.files?.[0])}
                      />
                      <label htmlFor={`note-image-${note.id}`}>Drop image or choose file. Max 5 MB.</label>
                    </div>

                    {note.image && (
                      <figure className="note-image">
                        <img src={note.image.dataUrl} alt={note.image.name || "Attached note"} />
                        <figcaption>
                          <span>
                            {note.image.name} {formatImageSize(note.image.size)}
                          </span>
                          <button type="button" className="ghost" onClick={() => updateNote(note.id, { image: null })}>
                            Remove
                          </button>
                        </figcaption>
                      </figure>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default Session;
