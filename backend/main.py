import os
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.evaluator import EvaluationAgent
from usage_tracker import get_usage

app = FastAPI(title="KtivaAI Backend")

# Configure CORS
origins = [
    "http://localhost:3000",
    "https://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    assignment_text: str
    user_essay: str

@app.get("/")
async def root():
    return {"message": "KtivaAI Backend is running."}

@app.get("/usage")
async def check_usage():
    """
    GET /usage - Returns the current token usage and limit.
    """
    return get_usage()

@app.post("/analyze")
async def analyze_essay(request: AnalyzeRequest):
    """
    POST /analyze - Main endpoint for grading.
    Streams progress updates followed by final JSON.
    """
    agent = EvaluationAgent()
    
    async def event_generator():
        async for status in agent.evaluate_stream(request.assignment_text, request.user_essay):
            # We send as data chunks for the stream.
            # Adding a newline to help simple frontend readers distinguish chunks.
            yield status + "\n"

    return StreamingResponse(event_generator(), media_type="text/plain")

if __name__ == "__main__":
    import uvicorn
    # In production, use "uvicorn main:app --host 0.0.0.0 --port 8000"
    uvicorn.run(app, host="0.0.0.0", port=8000)
