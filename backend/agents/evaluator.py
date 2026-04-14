import json
import asyncio
from typing import AsyncGenerator
from .content_specialist import ContentSpecialistAgent
from .language_specialist import LanguageSpecialistAgent
from .synthesizer import SynthesizerAgent
from usage_tracker import update_usage

class EvaluationAgent:
    """
    EvaluationAgent coordinates the agentic workflow.
    """

    def __init__(self, model_name: str = "gpt-4o-mini"):
        self.content_agent = ContentSpecialistAgent(model_name)
        self.language_agent = LanguageSpecialistAgent(model_name)
        self.synthesizer = SynthesizerAgent(model_name)

    async def evaluate_stream(self, assignment_text: str, user_essay: str) -> AsyncGenerator[str, None]:
        """
        Streams status updates through the agentic process in Hebrew.
        """
        yield "מאתחל תהליך הערכה..."
        await asyncio.sleep(0.5)

        # 1. Content Specialist
        yield "מומחה תוכן מעריך את המבנה והטיעונים..."
        content_task = self.content_agent.evaluate(assignment_text, user_essay)
        
        # 2. Language Specialist
        yield "מומחה לשון מנתח את התחביר והמשלב הלשוני..."
        language_task = self.language_agent.evaluate(assignment_text, user_essay)

        # Run both in parallel
        content_eval, language_eval = await asyncio.gather(content_task, language_task)
        
        # Track initial usage
        total_tokens = content_eval.get("_usage", 0) + language_eval.get("_usage", 0)

        yield "ניתוח הממדים הושלם."
        await asyncio.sleep(0.5)

        # 3. Synthesizer
        yield "מנתח סופי מגבש משוב ומיישב סתירות..."
        final_result = await self.synthesizer.synthesize(assignment_text, user_essay, content_eval, language_eval)
        
        # Add synthesizer usage
        total_tokens += final_result.get("_usage", 0)
        
        # Persist usage
        update_usage(total_tokens)

        yield "התהליך הסתיים."
        # Remove internal usage key before returning to user
        if "_usage" in final_result:
            del final_result["_usage"]
            
        yield json.dumps(final_result)
