# AI Interview Coach — Cloudflare Workers AI edition
#Notes Edition is also there.

> **Practice smarter. Interview better.**

AIIC (AI Interview Coach) is an AI-powered interview practice platform designed to help students and job seekers prepare for interviews through realistic, role-specific mock interviews.

Instead of simply giving users a list of interview questions, AIIC simulates an actual interview — asking questions, responding to answers, generating follow-ups when appropriate, and providing personalized feedback at the end.

---

## ✨ What is AIIC?

Interview preparation can often feel repetitive and difficult to evaluate.

AIIC turns that preparation into an interactive experience.

Users choose the role they want to prepare for, enter an AI-powered mock interview, answer questions one by one, and receive feedback on their performance after the interview.

### The core experience

**Choose a role → Start the interview → Answer questions → Handle follow-ups → Get AI feedback**

AIIC focuses on making interview practice accessible, simple, and less intimidating.

---

## 🚀 Features

### 🎯 Role-Specific Interviews
Generate interview questions based on the role the user is preparing for.

### 💬 Interactive Mock Interviews
AIIC conducts the interview one question at a time instead of presenting a static question bank.

### 🔄 Intelligent Follow-Up Questions
When an answer is vague or needs clarification, the AI can ask a relevant follow-up question to make the interview feel more natural.

### 📊 AI-Powered Feedback
After the interview, AIIC analyzes the conversation and provides feedback including:

- Language and communication feedback
- Overall impression
- Strengths
- Areas for improvement
- Overall interview score

### 📝 Personal Notes
Users can write and save notes while preparing for interviews.

### 📚 Past Interviews
Completed interviews can be reviewed later so users can track and reflect on their preparation.

### 💾 Local Data Storage
Interview history and notes are currently stored locally in the user's browser, keeping the initial version simple and lightweight.

---

## 🧠 How the AI Works

AIIC uses **Cloudflare Workers AI** to power its interview intelligence.

The application uses an AI model to handle three main tasks:

1. **Question Generation**
   - Creates a structured set of interview questions based on the selected role.

2. **Interview Conversation**
   - Evaluates the user's previous answer and determines whether a follow-up question would be useful.

3. **Interview Analysis**
   - Reviews the completed interview and generates structured feedback and an overall score.

The AI is accessed through a server-side Cloudflare Worker, so sensitive AI credentials are not exposed in the frontend.

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │      AIIC UI        │
                    │   React + Vite      │
                    └──────────┬──────────┘
                               │
                               │ API Requests
                               ▼
                    ┌─────────────────────┐
                    │ Cloudflare Worker   │
                    │     API Layer       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Cloudflare Workers  │
                    │        AI           │
                    │                     │
                    │ Llama 3.1 8B FP8    │
                    └─────────────────────┘

              Browser Local Storage
              ├── Interview History
              └── Preparation Notes
