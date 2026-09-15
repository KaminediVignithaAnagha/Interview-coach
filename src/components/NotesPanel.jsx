import { useState, useEffect, useRef } from "react";

export default function NotesPanel({ notes, onSave }) {
  const [draft, setDraft] = useState(notes);
  const [justSaved, setJustSaved] = useState(false);
  const savedTimeout = useRef(null);

  useEffect(() => {
    setDraft(notes);
  }, [notes]);

  useEffect(() => {
    return () => {
      if (savedTimeout.current) clearTimeout(savedTimeout.current);
    };
  }, []);

  function handleSaveClick() {
    onSave(draft);
    setJustSaved(true);
    if (savedTimeout.current) clearTimeout(savedTimeout.current);
    savedTimeout.current = setTimeout(() => setJustSaved(false), 1500);
  }

  return (
    <div className="notes-panel">
      <h2 className="notes-heading">Notes</h2>
      <p className="notes-hint">Jot down points to revisit after the interview.</p>
      <textarea
        className="notes-textarea"
        placeholder="e.g. Revisit the leadership example — too vague..."
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <button type="button" className="primary-button notes-save-button" onClick={handleSaveClick}>
        {justSaved ? "Saved" : "Save notes"}
      </button>
    </div>
  );
}
