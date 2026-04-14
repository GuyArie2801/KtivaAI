KtivaAI - Backend Design Document
Project Goal: A specialized AI evaluator for the Israeli Psychometric writing task, simulating official NITE scoring (1–6 scale) using an agentic workflow.

1. System Architecture
   Frontend: Next.js (App Router).

Backend: Python (FastAPI) — Recommended over Node.js for easier integration with AI frameworks like LangChain or CrewAI.

Communication: REST API with Server-Sent Events (SSE).

Why: Agentic workflows take 10–30 seconds. Standard POST requests might timeout. SSE allows the frontend to show "Content Expert is thinking..." in real-time.

2. The Agentic Flow (The "Brain")
   Input: User Essay + Assignment Prompt.

Agent A (Content Specialist): Evaluates focus, coherence, and strength of argument (Score 1–6).

Agent B (Language Specialist): Evaluates syntax, vocabulary, and formal register (Score 1–6).

Agent C (Synthesizer): Reviews A and B, resolves conflicts, and produces the final Hebrew feedback and weighted score.

3. API Endpoints
   POST /evaluate: Receives { prompt: string, essay: string }.

GET /evaluate/stream: Streams the status of the agents back to the client.
