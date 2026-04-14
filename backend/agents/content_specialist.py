import json
from .base_agent import BaseAgent
from langchain_core.messages import SystemMessage, HumanMessage

class ContentSpecialistAgent(BaseAgent):
    """
    Agent A: Evaluates focus, coherence, and strength of argument (Score 1–6).
    """

    async def evaluate(self, assignment_text: str, user_essay: str) -> dict:
        if not self.llm:
            return {"content_score": 5, "content_feedback": "Mock content feedback."}

        system_prompt = (
            "Role: You are a Content Specialist for the Israeli Psychometric Exam writing task.\n\n"
            "Goal: Evaluate strictly according to NITE (National Institute for Testing and Evaluation) Content Dimension (ממד התוכן).\n\n"
            "Dimensions for Evaluation:\n"
            "1. Focus & Clarity: Does the essay strictly address the prompt? Are ideas clear?\n"
            "2. Logical Depth: Are arguments understandable and logically linked?\n"
            "3. Critical Thinking: Distinction between facts/opinions, examining multiple perspectives, and handling opposing views (counter-arguments).\n"
            "4. Conciseness: Free of unnecessary repetitions and 'smearing' (מריחות).\n"
            "5. Length: Penalty if shorter than 25 lines (approx. 250 words).\n\n"
            "Output: A JSON object with 'content_score' (1-6) and 'content_feedback' (Hebrew text detailing the evaluation)."
        )

        human_prompt = f"Assignment:\n{assignment_text}\n\nEssay:\n{user_essay}"

        response = await self.llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_prompt)
        ])

        # Extract usage info
        usage = response.response_metadata.get("token_usage", {})
        total_tokens = usage.get("total_tokens", 0)

        raw_content = response.content
        if "```json" in raw_content:
            raw_content = raw_content.split("```json")[1].split("```")[0].strip()
        
        try:
            result = json.loads(raw_content)
            result["_usage"] = total_tokens
            return result
        except json.JSONDecodeError:
            # Fallback for LLM non-JSON output
            return {"content_score": 0, "content_feedback": f"Error parsing: {raw_content}", "_usage": total_tokens}
