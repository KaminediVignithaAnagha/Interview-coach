import { useState, useEffect, useCallback } from "react";
import RoleSetup from "./components/RoleSetup.jsx";
import InterviewChat from "./components/InterviewChat.jsx";
import PastInterviews from "./components/PastInterviews.jsx";
import { generateQuestions } from "./services/api.js";
import { getSessions, deleteSession } from "./services/storage.js";

export default function App() {
  const [role, setRole] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState([]);

  const refreshSessions = useCallback(() => {
    setSessions(getSessions());
  }, []);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  async function handleStart(chosenRole) {
    setIsLoading(true);
    setError("");
    try {
      const generated = await generateQuestions(chosenRole);
      setQuestions(generated);
      setRole(chosenRole);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleBackToDashboard() {
    setRole(null);
    setQuestions(null);
    refreshSessions();
  }

  function handleDeleteSession(id) {
    deleteSession(id);
    refreshSessions();
  }

  const onInterviewScreen = role && questions;

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>AI Interview Coach</h1>
        <p>Practice interview questions tailored to the role you're applying for.</p>
      </header>

      {!onInterviewScreen ? (
        <>
          <RoleSetup onStart={handleStart} isLoading={isLoading} />
          {error && <p className="error-text">{error}</p>}
          <PastInterviews sessions={sessions} onDelete={handleDeleteSession} />
        </>
      ) : (
        <InterviewChat
          role={role}
          questions={questions}
          onRestart={handleBackToDashboard}
          onBackToDashboard={handleBackToDashboard}
        />
      )}
    </div>
  );
}
