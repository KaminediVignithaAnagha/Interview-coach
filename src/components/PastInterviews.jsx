import { useState } from "react";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PastInterviews({ sessions, onDelete }) {
  const [expandedId, setExpandedId] = useState(null);

  if (sessions.length === 0) {
    return null;
  }

  return (
    <div className="past-interviews">
      <h2 className="section-heading">Past interviews</h2>
      <div className="session-list">
        {sessions.map((session) => {
          const isExpanded = expandedId === session.id;
          return (
            <div className="session-card" key={session.id}>
              <button
                type="button"
                className="session-summary"
                onClick={() => setExpandedId(isExpanded ? null : session.id)}
              >
                <div>
                  <div className="session-role">{session.role}</div>
                  <div className="session-date">{formatDate(session.date)}</div>
                </div>
                <div className="score-badge small">{session.feedback.overallScore}/10</div>
              </button>

              {isExpanded && (
                <div className="session-details">
                  <div className="feedback-section">
                    <h3>Language</h3>
                    <p>{session.feedback.languageFeedback}</p>
                  </div>
                  <div className="feedback-section">
                    <h3>Overall impression</h3>
                    <p>{session.feedback.impressionFeedback}</p>
                  </div>
                  {session.feedback.strengths.length > 0 && (
                    <div className="feedback-section">
                      <h3>Strengths</h3>
                      <ul className="feedback-list strengths">
                        {session.feedback.strengths.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {session.feedback.improvements.length > 0 && (
                    <div className="feedback-section">
                      <h3>To improve</h3>
                      <ul className="feedback-list improvements">
                        {session.feedback.improvements.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {session.notes && session.notes.trim() && (
                    <div className="feedback-section">
                      <h3>Your notes</h3>
                      <p className="notes-readback">{session.notes}</p>
                    </div>
                  )}
                  <button
                    type="button"
                    className="text-link-button danger"
                    onClick={() => onDelete(session.id)}
                  >
                    Delete this session
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
