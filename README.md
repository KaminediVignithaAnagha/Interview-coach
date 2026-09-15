# AIIC — Cloudflare Workers AI edition

This is the cleaned Cloudflare version of the AI Interview Coach project.

## What changed

- The React UI is preserved.
- Ollama and the Express server were removed.
- The browser now calls same-origin `/api/...` routes.
- Those routes run inside a Cloudflare Worker.
- The Worker uses a Cloudflare Workers AI binding (`env.AI`) and the model `@cf/meta/llama-3.1-8b-instruct-fp8`.
- No AI API key is stored in the React app or committed to GitHub.
- Interview history and notes still use browser `localStorage`, just like before.

## Project structure

```text
AIIC-Cloudflare-WorkersAI/
├── src/                 React UI
├── worker/index.js      Cloudflare Worker + Workers AI calls
├── wrangler.jsonc       Cloudflare config + AI binding
├── vite.config.js       React + Cloudflare Vite integration
├── index.html
└── package.json
```

## Run it locally

You need Node.js installed.

```bash
npm install
npm run dev
```

The Cloudflare Vite plugin runs the frontend and Worker together so the `/api/...` routes work locally too.

## Deploy it yourself to Cloudflare

### 1. Make a free Cloudflare account

Create/sign in to your own Cloudflare account. Do not share the login with anyone.

### 2. Install dependencies

```bash
npm install
```

### 3. Log Wrangler into your Cloudflare account

```bash
npx wrangler login
```

This opens Cloudflare's login/authorization flow. You do not paste an AI API key into this project.

### 4. Deploy

```bash
npm run deploy
```

Wrangler will build the React app, deploy the Worker, attach the Workers AI binding, and give you a `*.workers.dev` URL.

## Quick health check after deployment

Open this path on your deployed site:

```text
/api/health
```

You should get JSON showing `ok: true` and `provider: "Cloudflare Workers AI"`.

Then test the full app:

1. Enter a role.
2. Generate interview questions.
3. Answer a question.
4. Confirm a follow-up may appear.
5. Finish the interview.
6. Confirm feedback appears.
7. Return to the dashboard and confirm the saved interview is visible.

## Important safety / GitHub notes

This project intentionally does not contain an AI API key.

Before pushing to GitHub, keep these ignored:

```text
node_modules/
dist/
.wrangler/
.dev.vars
.env
.env.*
```

Do not commit Cloudflare tokens, passwords, cookies, `.dev.vars`, or `.env` files if you add them later.

## Where the AI lives

The only file that talks to the AI is:

```text
worker/index.js
```

The React UI talks only to these endpoints:

```text
POST /api/generate-questions
POST /api/next-turn
POST /api/analyze-interview
```

That separation means you can swap the AI model later without rebuilding the UI.

## Cost note

Workers AI has usage limits and pricing that Cloudflare can change. The project is structured to use Cloudflare's Workers AI binding, but you should check your Cloudflare dashboard and current Workers AI pricing/limits before inviting a large number of users. Add app-level rate limits before a public launch with significant traffic.
