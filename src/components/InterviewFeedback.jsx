export default function InterviewFeedback({ role, feedback, notes, onBackToDashboard }) {
  const { languageFeedback, impressionFeedback, strengths, improvements, overallScore } = feedback;

  return (
    <div className="panel">
      <div className="feedback-header">
        <h2>How you did — {role}</h2>
        <div className="score-badge">{overallScore}/10</div>
      </div>

      <div className="feedback-section">
        <h3>Language</h3>
        <p>{languageFeedback}</p>
      </div>

      <div className="feedback-section">
        <h3>Overall impression</h3>
        <p>{impressionFeedback}</p>
      </div>

      {strengths.length > 0 && (
        <div className="feedback-section">
          <h3>Strengths</h3>
          <ul className="feedback-list strengths">
            {strengths.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {improvements.length > 0 && (
        <div className="feedback-section">
          <h3>To improve</h3>
          <ul className="feedback-list improvements">
            {improvements.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {notes && notes.trim() && (
        <div className="feedback-section">
          <h3>Your notes</h3>
          <p className="notes-readback">{notes}</p>
        </div>
      )}

      <div className="feedback-actions">
        <button className="primary-button" onClick={onBackToDashboard}>
          Back to dashboard
        </button>
      </div>
    </div>
  );
}
