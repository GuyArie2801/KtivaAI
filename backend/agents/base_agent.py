import os
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()

class BaseAgent:
    """
    BaseAgent provides the common LLM initialization for OpenAI.
    """
    def __init__(self, model_name: str = "gpt-4o-mini"):
        # We assume OPENAI_API_KEY_KTIVA is in the environment
        self.api_key = os.getenv("OPENAI_API_KEY_KTIVA")
        if self.api_key:
            self.llm = ChatOpenAI(
                api_key=self.api_key, 
                model=model_name, 
                temperature=0
            )
        else:
            self.llm = None  # Mocking logic handled in subclasses or evaluator
