const MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function extractJson(text, isArray) {
  const cleaned = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const pattern = isArray ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/;
    const match = cleaned.match(pattern);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

async function callModel(env, systemPrompt, userContent, maxTokens = 700) {
  const result = await env.AI.run(MODEL, {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    max_tokens: maxTokens,
    temperature: 0.3,
  });

  if (!result || typeof result.response !== "string") {
    throw new Error("Workers AI returned an unexpected response.");
  }

  return result.response.trim();
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function handleGenerateQuestions(request, env) {
  const body = await readJson(request);
  const role = body?.role;

  if (!role || typeof role !== "string" || !role.trim()) {
    return json({ error: "Missing 'role' in request body." }, 400);
  }

  const systemPrompt = `You are an interview question generator. Given a job role, return exactly 8 interview questions as a JSON array of strings, nothing else. No preamble, no markdown fences, no numbering inside the strings. Mix behavioral questions about past experience and soft skills with role-specific technical or practical questions. Keep each question under 25 words. Respond with ONLY the JSON array, nothing before or after it.`;

  try {
    const raw = await callModel(env, systemPrompt, `Job role: ${role.trim()}`, 650);
    const questions = extractJson(raw, true);

    if (!Array.isArray(questions) || questions.length === 0) {
      console.error("Could not parse questions from Workers AI:", raw);
      return json({ error: "The AI did not return a clean question list. Please try again." }, 502);
    }

    return json({ questions: questions.slice(0, 8).map(String) });
  } catch (error) {
    console.error("generate-questions error:", error);
    return json({ error: "Could not generate questions right now. Please try again." }, 500);
  }
}

async function handleNextTurn(request, env) {
  const body = await readJson(request);
  const { role, currentQuestion, history, alreadyFollowedUp } = body || {};

  if (!role || !currentQuestion || !Array.isArray(history)) {
    return json({ error: "Missing role, currentQuestion, or history." }, 400);
  }

  if (alreadyFollowedUp) {
    return json({ followUp: null });
  }

  const safeHistory = history
    .filter((entry) => entry && (entry.type === "question" || entry.type === "answer"))
    .slice(-16);

  const transcript = safeHistory
    .map((entry) =>
      entry.type === "question"
        ? `Interviewer: ${String(entry.text || "")}`
        : `Candidate: ${String(entry.text || "")}`
    )
    .join("\n");

  const systemPrompt = `You are conducting a mock interview for a ${String(role)} role. You just asked the candidate a question and they answered. Decide if the answer is vague, too short, or missing a concrete example. If so, ask ONE short natural follow-up question. If the answer is already specific and complete, do not ask a follow-up. Respond with ONLY a JSON object in exactly one of these shapes: {"followUp":"your question"} or {"followUp":null}.`;

  try {
    const raw = await callModel(
      env,
      systemPrompt,
      `Conversation so far:\n${transcript}\n\nCurrent question: ${String(currentQuestion)}`,
      220
    );
    const parsed = extractJson(raw, false);
    const followUp = typeof parsed?.followUp === "string" ? parsed.followUp.trim() : null;
    return json({ followUp: followUp || null });
  } catch (error) {
    console.error("next-turn error:", error);
    // Graceful fallback: never block the interview because a follow-up check failed.
    return json({ followUp: null });
  }
}

async function handleAnalyzeInterview(request, env) {
  const body = await readJson(request);
  const { role, transcript } = body || {};

  if (!role || !Array.isArray(transcript) || transcript.length === 0) {
    return json({ error: "Missing role or transcript." }, 400);
  }

  const safeTranscript = transcript
    .filter((entry) => entry && (entry.type === "question" || entry.type === "answer"))
    .slice(-40)
    .map((entry) =>
      entry.type === "question"
        ? `Interviewer: ${String(entry.text || "")}`
        : `Candidate: ${String(entry.text || "")}`
    )
    .join("\n");

  const systemPrompt = `You are an expert interview coach reviewing a completed mock interview for a ${String(role)} role. Evaluate the CANDIDATE's answers only. Return ONLY valid JSON with this exact shape: {"languageFeedback":"...","impressionFeedback":"...","strengths":["..."],"improvements":["..."],"overallScore":7}. languageFeedback should be 2-3 sentences about clarity, grammar, professionalism, and filler words. impressionFeedback should be 2-3 sentences about confidence, structure, and specificity. strengths and improvements should each contain 2-4 short concrete items. overallScore must be an integer from 1 to 10.`;

  try {
    const raw = await callModel(env, systemPrompt, `Transcript:\n${safeTranscript}`, 950);
    const parsed = extractJson(raw, false);

    if (!parsed || typeof parsed.overallScore === "undefined") {
      console.error("Could not parse interview analysis from Workers AI:", raw);
      return json({ error: "The AI did not return a clean analysis. Please try again." }, 502);
    }

    const score = Math.max(1, Math.min(10, Math.round(Number(parsed.overallScore) || 1)));

    return json({
      languageFeedback: typeof parsed.languageFeedback === "string" ? parsed.languageFeedback : "",
      impressionFeedback:
        typeof parsed.impressionFeedback === "string" ? parsed.impressionFeedback : "",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 4).map(String) : [],
      improvements: Array.isArray(parsed.improvements)
        ? parsed.improvements.slice(0, 4).map(String)
        : [],
      overallScore: score,
    });
  } catch (error) {
    console.error("analyze-interview error:", error);
    return json({ error: "Could not analyze the interview right now. Please try again." }, 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/api/health") {
      return json({ ok: true, provider: "Cloudflare Workers AI", model: MODEL });
    }

    if (request.method !== "POST") {
      return json({ error: "Not found." }, 404);
    }

    if (url.pathname === "/api/generate-questions") {
      return handleGenerateQuestions(request, env);
    }

    if (url.pathname === "/api/next-turn") {
      return handleNextTurn(request, env);
    }

    if (url.pathname === "/api/analyze-interview") {
      return handleAnalyzeInterview(request, env);
    }

    return json({ error: "Not found." }, 404);
  },
};
