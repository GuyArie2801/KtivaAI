# KtivaAI ✍️🤖

KtivaAI is a specialized AI-powered evaluator for the Israeli Psychometric Exam's writing task. It simulates official NITE (National Institute for Testing and Evaluation) scoring (1–6 scale) using a sophisticated agentic workflow.

## 🚀 The Brain: Agentic Workflow

Unlike traditional AI evaluations, KtivaAI employs a multi-agent system to ensure professional, accurate, and consistent feedback:

1.  **Agent A: Content Specialist (מומחה תוכן)**
    *   Evaluates focus, logical depth, coherence, and critical thinking.
    *   Checks for essay length requirements (NITE standards).
2.  **Agent B: Language Specialist (מומחה לשון)**
    *   Analyzes academic register, vocabulary richness, grammar, and syntax.
    *   Penalizes incorrect usage of "flowery" language.
3.  **Agent C: Synthesizer (מנתח סופי)**
    *   Reviews findings from both specialists.
    *   Resolves inconsistencies and generates a structured Hebrew report.
    *   Calculates the final weighted score.

## ✨ Key Features

*   **NITE Standard Alignment**: Specifically tuned to follow the official Israeli Psychometric grading rubrics.
*   **Real-time Feedback**: Uses Server-Sent Events (SSE) to stream agent status updates in Hebrew.
*   **Structured Hebrew Reports**:
    1.  **General Feedback**: Strengths and weaknesses summary.
    2.  **Content Analysis**: Deep dive with examples and improvement tips.
    3.  **Language Analysis**: Vocabulary and syntax feedback with concrete examples.
*   **Powered by Gemini**: Utilizes the latest `gemini-2.0-flash` model for fast and intelligent processing.

## 🛠️ Tech Stack

*   **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS.
*   **Backend**: Python (FastAPI), LangChain.
*   **AI**: Google Gemini API via `langchain-google-genai`.

## 📦 Project Structure

```text
KtivaAI/
├── backend/            # FastAPI Server & AI Agents
│   ├── agents/         # Content, Language, and Synthesizer agents
│   └── main.py         # API Endpoints & Streaming logic
├── frontend/           # Next.js Application
│   └── src/app         # UI Components & Page logic
└── info/               # Supplemental Psychometric data & resources
```

## ⚙️ Setup Instructions

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file and add your Google AI Studio API key:
   ```env
   AI_API_KEY_KTIVA=your_gemini_api_key_here
   ```
4. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📄 License

This project is developed for educational and training purposes for the Israeli Psychometric Exam.
