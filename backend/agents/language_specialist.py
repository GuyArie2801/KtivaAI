import json
from .base_agent import BaseAgent
from langchain_core.messages import SystemMessage, HumanMessage

class LanguageSpecialistAgent(BaseAgent):
    """
    Agent B: Evaluates syntax, vocabulary, and formal register (Score 1–6).
    """

    async def evaluate(self, assignment_text: str, user_essay: str) -> dict:
        if not self.llm:
            return {"language_score": 4, "language_feedback": "Mock language feedback."}

        system_prompt = (
            "Role: You are a Language Specialist for the Israeli Psychometric Exam writing task.\n\n"
            "Goal: Evaluate strictly according to NITE (National Institute for Testing and Evaluation) Language Dimension (ממד הלשון).\n\n"
            "Dimensions for Evaluation:\n"
            "1. Academic Register: Style for formal academic writing (כתיבה עיונית).\n"
            "2. Vocabulary: Linguistic richness and precision. Penalty for incorrect 'flowery' (מליצות).\n"
            "3. Organization: Logical connectors (מילות קישור), transition sentences, and paragraph division.\n"
            "4. Correctness: Hebrew grammar, syntax, and proper word usage.\n\n"
            "Output: A JSON object with 'language_score' (1-6) and 'language_feedback' (Hebrew text detailing the evaluation)."
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
            return {"language_score": 0, "language_feedback": f"Error parsing: {raw_content}", "_usage": total_tokens}
