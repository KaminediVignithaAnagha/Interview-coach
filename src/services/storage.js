const STORAGE_KEY = "ai-interview-coach-sessions";
const DRAFT_NOTES_KEY = "ai-interview-coach-draft-notes";

export function getSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to read saved sessions:", err);
    return [];
  }
}

export function saveSession(session) {
  const sessions = getSessions();
  const withId = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    ...session,
  };
  const updated = [withId, ...sessions];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save session:", err);
  }
  return withId;
}

export function deleteSession(id) {
  const sessions = getSessions().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

// Draft notes: scratch space for whichever interview is currently in progress.
// Saved explicitly (not just kept in memory) so a note survives an accidental
// refresh mid-interview.
export function saveDraftNotes(text) {
  try {
    localStorage.setItem(DRAFT_NOTES_KEY, text);
  } catch (err) {
    console.error("Failed to save notes:", err);
  }
}

export function getDraftNotes() {
  try {
    return localStorage.getItem(DRAFT_NOTES_KEY) || "";
  } catch (err) {
    console.error("Failed to read notes:", err);
    return "";
  }
}

export function clearDraftNotes() {
  localStorage.removeItem(DRAFT_NOTES_KEY);
}
