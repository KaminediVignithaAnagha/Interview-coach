import { useState, useEffect, useRef } from "react";
import { getNextTurn, analyzeInterview } from "../services/api.js";
import { saveSession, getDraftNotes, saveDraftNotes, clearDraftNotes } from "../services/storage.js";
import InterviewFeedback from "./InterviewFeedback.jsx";
import NotesPanel from "./NotesPanel.jsx";

export default function InterviewChat({ role, questions, onRestart, onBackToDashboard }) {
  const [mainIndex, setMainIndex] = useState(0);
  const [followedUpOnCurrent, setFollowedUpOnCurrent] = useState(false);
  const [answer, setAnswer] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [log, setLog] = useState([{ type: "question", text: questions[0] }]);
  const [notes, setNotes] = useState(() => getDraftNotes());

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const hasAnalyzed = useRef(false);

  const isFinished = mainIndex >= questions.length;

  useEffect(() => {
    if (!isFinished || hasAnalyzed.current) return;
    hasAnalyzed.current = true;

    async function runAnalysis() {
      setIsAnalyzing(true);
      setAnalysisError("");
      try {
        const result = await analyzeInterview({ role, transcript: log });
        setFeedback(result);
        saveSession({ role, transcript: log, feedback: result, notes });
        clearDraftNotes();
      } catch (err) {
        console.error(err);
        setAnalysisError(err.message || "Couldn't analyze this interview.");
      } finally {
        setIsAnalyzing(false);
      }
    }

    runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!answer.trim() || isThinking) return;

    const answerEntry = { type: "answer", text: answer.trim() };
    const updatedLog = [...log, answerEntry];
    setLog(updatedLog);
    setAnswer("");
    setIsThinking(true);

    try {
      const followUp = await getNextTurn({
        role,
        currentQuestion: questions[mainIndex],
        history: updatedLog,
        alreadyFollowedUp: followedUpOnCurrent,
      });

      if (followUp) {
        setLog((prev) => [...prev, { type: "question", text: followUp }]);
        setFollowedUpOnCurrent(true);
      } else {
        advanceToNextQuestion(updatedLog);
      }
    } catch (err) {
      console.error(err);
      // If the follow-up check fails, don't block the interview — just move on.
      advanceToNextQuestion(updatedLog);
    } finally {
      setIsThinking(false);
    }
  }

  function advanceToNextQuestion(currentLog) {
    const nextIndex = mainIndex + 1;
    setMainIndex(nextIndex);
    setFollowedUpOnCurrent(false);
    if (nextIndex < questions.length) {
      setLog([...currentLog, { type: "question", text: questions[nextIndex] }]);
    }
  }

  function handleRestartClick() {
    if (log.length > 1) {
      const confirmed = window.confirm(
        "Restart this interview? Your current answers will be lost."
      );
      if (!confirmed) return;
    }
    clearDraftNotes();
    onRestart();
  }

  function handleSaveNotes(text) {
    setNotes(text);
    saveDraftNotes(text);
  }

  const progressPercent = Math.min(100, Math.round((mainIndex / questions.length) * 100));

  if (isFinished) {
    if (feedback) {
      return (
        <InterviewFeedback
          role={role}
          feedback={feedback}
          notes={notes}
          onBackToDashboard={onBackToDashboard}
        />
      );
    }

    return (
      <div className="panel">
        {isAnalyzing && <p>Analyzing your answers...</p>}
        {analysisError && (
          <>
            <p className="error-text">{analysisError}</p>
            <button className="text-link-button" onClick={onBackToDashboard}>
              Back to dashboard
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="interview-layout">
      <NotesPanel notes={notes} onSave={handleSaveNotes} />

      <div className="panel interview-main">
        <div className="progress-row">
          <span>{role}</span>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span>
            {Math.min(mainIndex + 1, questions.length)} / {questions.length}
          </span>
          <button
            type="button"
            className="text-link-button restart-button"
            onClick={handleRestartClick}
          >
            Restart
          </button>
        </div>

        <div className="chat-log">
          {log.map((entry, i) => (
            <div key={i} className={`bubble ${entry.type}`}>
              {entry.text}
            </div>
          ))}
          {isThinking && <div className="bubble question">Thinking...</div>}
        </div>

        <form className="answer-form" onSubmit={handleSubmit}>
          <textarea
            placeholder="Type your answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isThinking}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                handleSubmit(e);
              }
            }}
          />
          <button className="primary-button" type="submit" disabled={isThinking}>
            {isThinking ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
