async function postJson(path, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
}

export async function generateQuestions(role) {
  const data = await postJson("/api/generate-questions", { role });
  return data.questions;
}

export async function getNextTurn({ role, currentQuestion, history, alreadyFollowedUp }) {
  const data = await postJson("/api/next-turn", {
    role,
    currentQuestion,
    history,
    alreadyFollowedUp,
  });
  return data.followUp;
}

export async function analyzeInterview({ role, transcript }) {
  return postJson("/api/analyze-interview", { role, transcript });
}
