import json
from .base_agent import BaseAgent
from langchain_core.messages import SystemMessage, HumanMessage

class SynthesizerAgent(BaseAgent):
    """
    Agent C: Synthesizer - Reviews Content and Language evaluations, resolves conflicts,
    and produces final Hebrew feedback and weighted score.
    """

    async def synthesize(self, assignment_text: str, user_essay: str, content_eval: dict, language_eval: dict) -> dict:
        if not self.llm:
            c_score = content_eval.get("content_score", 0)
            l_score = language_eval.get("language_score", 0)
            return {
                "content_score": c_score,
                "language_score": l_score,
                "total_score": (c_score + l_score) / 2,
                "hebrew_feedback": "Synthesized mock feedback: Well done."
            }

        system_prompt = (
            "Role: You are a Senior Synthesizer and final evaluator for the Israeli Psychometric Exam writing task.\n\n"
            "Goal: Review the evaluations from the Content Specialist and Language Specialist, "
            "resolve any inconsistencies, and provide a professional feedback report in Hebrew.\n\n"
            "Mandatory Feedback Structure (Hebrew):\n"
            "1. משוב כללי (General Feedback): A summary of the essay's strengths and weaknesses.\n"
            "2. משוב על ממד התוכן (Content Feedback): Detailed analysis including specific strengths, weaknesses, and concrete examples from the text. Provide constructive suggestions for improvement.\n"
            "3. משוב על ממד הלשון (Language Feedback): Detailed analysis including specific strengths, weaknesses, and concrete examples from the text. Provide constructive suggestions for improvement (e.g., vocabulary upgrades, syntax corrections).\n\n"
            "Instructions:\n"
            "- Use the structured format above strictly.\n"
            "- Ensure the final scores reflect the consensus or resolve any major discrepancies.\n"
            "- Calculate a 'total_score' as the average of 'content_score' and 'language_score' (round to 1 decimal place).\n"
            "- The feedback must be in Hebrew.\n\n"
            "Output: A JSON object with 'content_score' (int), 'language_score' (int), 'total_score' (float), 'hebrew_feedback' (string)."
        )

        human_prompt = (
            f"Assignment:\n{assignment_text}\n\n"
            f"Essay:\n{user_essay}\n\n"
            f"Content Evaluation:\n{json.dumps(content_eval, ensure_ascii=False)}\n\n"
            f"Language Evaluation:\n{json.dumps(language_eval, ensure_ascii=False)}"
        )

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
            return {
                "content_score": content_eval.get("content_score", 0),
                "language_score": language_eval.get("language_score", 0),
                "total_score": (content_eval.get("content_score", 0) + language_eval.get("language_score", 0)) / 2,
                "hebrew_feedback": f"Error parsing synthesizer output. Raw: {raw_content}",
                "_usage": total_tokens
            }
