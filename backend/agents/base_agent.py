import os
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

class BaseAgent:
    """
    BaseAgent provides the common LLM initialization for Google Gemini.
    """
    def __init__(self, model_name: str = "gemini-2.5-flash"):
        # We assume AI_API_KEY_KTIVA is in the environment
        self.api_key = os.getenv("AI_API_KEY_KTIVA")
        if self.api_key:
            # Note: langchain-google-genai uses 'google_api_key'
            self.llm = ChatGoogleGenerativeAI(
                google_api_key=self.api_key, 
                model=model_name, 
                temperature=0,
                convert_system_message_to_human=True # Gemini handles system messages through a specific parameter or conversion
            )
        else:
            self.llm = None  # Mocking logic handled in subclasses or evaluator
