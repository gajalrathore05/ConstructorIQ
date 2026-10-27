import json
import logging
import base64
from typing import Optional, Dict, Any, List
from app.core.config import settings

logger = logging.getLogger(__name__)

DEMO_CHAT_RESPONSE = """This is a **demo response** — no AI provider is configured.

**To enable real AI analysis:**
1. Copy `.env.example` to `.env` in the backend directory
2. Set `GEMINI_API_KEY=your_key_here` (get a free key at [aistudio.google.com](https://aistudio.google.com))
3. Or set `OPENAI_API_KEY=your_key_here` with `AI_PROVIDER=openai`
4. Restart the backend server

Once configured, ConstructIQ will use the real AI model to answer your construction questions with detailed, context-aware responses about site safety, structural analysis, project planning, and more."""


class AIService:
    def __init__(self):
        self._gemini_model = None
        self._openai_client = None

    def _init_gemini(self):
        if self._gemini_model is None and settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self._gemini_model = genai.GenerativeModel("gemini-1.5-flash")
                logger.info("Gemini client initialized.")
            except Exception as e:
                logger.error(f"Failed to init Gemini: {e}")
        return self._gemini_model

    def _init_openai(self):
        if self._openai_client is None and settings.OPENAI_API_KEY:
            try:
                from openai import OpenAI
                self._openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
                logger.info("OpenAI client initialized.")
            except Exception as e:
                logger.error(f"Failed to init OpenAI: {e}")
        return self._openai_client

    CONSTRUCTION_SYSTEM = (
        "You are ConstructIQ, an expert AI assistant for construction management, "
        "civil engineering, site safety, structural analysis, project planning, and real estate. "
        "Provide detailed, practical, professional advice. Format responses with clear headings "
        "and bullet points where appropriate. Always note when professional on-site inspection is required."
    )

    async def chat(self, message: str, history: List[Dict] = None, system_prompt: str = None) -> tuple:
        """Returns (response_text, is_demo)"""
        if not settings.ai_available:
            return DEMO_CHAT_RESPONSE, True

        sys = system_prompt or self.CONSTRUCTION_SYSTEM
        try:
            if settings.AI_PROVIDER == "gemini":
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel("gemini-1.5-flash", system_instruction=sys)
                chat_history = []
                if history:
                    for msg in history[-10:]:
                        role = "user" if msg["role"] == "user" else "model"
                        chat_history.append({"role": role, "parts": [msg["content"]]})
                chat = model.start_chat(history=chat_history)
                response = chat.send_message(message)
                return response.text, False

            elif settings.AI_PROVIDER == "openai":
                from openai import OpenAI
                client = OpenAI(api_key=settings.OPENAI_API_KEY)
                messages = [{"role": "system", "content": sys}]
                if history:
                    for msg in history[-10:]:
                        messages.append({"role": msg["role"], "content": msg["content"]})
                messages.append({"role": "user", "content": message})
                response = client.chat.completions.create(
                    model="gpt-4o-mini", messages=messages, max_tokens=2000
                )
                return response.choices[0].message.content, False

        except Exception as e:
            logger.error(f"AI chat error: {e}")
            return f"AI service temporarily unavailable: {str(e)}\n\nPlease check your API key configuration.", True

        return DEMO_CHAT_RESPONSE, True

    async def analyze_image(self, image_path: str, prompt: str, system_prompt: str = None) -> tuple:
        """Returns (response_text, is_demo)"""
        if not settings.ai_available:
            return None, True

        try:
            with open(image_path, "rb") as f:
                image_data = f.read()

            if settings.AI_PROVIDER == "gemini":
                import google.generativeai as genai
                import PIL.Image
                import io
                genai.configure(api_key=settings.GEMINI_API_KEY)
                sys = system_prompt or "You are an expert construction and structural analysis AI."
                model = genai.GenerativeModel("gemini-1.5-flash", system_instruction=sys)
                img = PIL.Image.open(io.BytesIO(image_data))
                response = model.generate_content([prompt, img])
                return response.text, False

            elif settings.AI_PROVIDER == "openai":
                from openai import OpenAI
                client = OpenAI(api_key=settings.OPENAI_API_KEY)
                img_b64 = base64.b64encode(image_data).decode()
                response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": system_prompt or "You are an expert construction analysis AI."},
                        {"role": "user", "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}}
                        ]}
                    ],
                    max_tokens=2000
                )
                return response.choices[0].message.content, False

        except Exception as e:
            logger.error(f"Image analysis error: {e}")
            return None, True

        return None, True

    async def generate_structured_json(self, prompt: str, schema_description: str, system_prompt: str = None) -> tuple:
        """Returns (dict_or_none, is_demo)"""
        if not settings.ai_available:
            return None, True

        json_prompt = (
            f"{prompt}\n\n"
            f"Respond ONLY with valid JSON matching this schema:\n{schema_description}\n"
            "Do not include any text before or after the JSON."
        )
        try:
            if settings.AI_PROVIDER == "gemini":
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                sys = system_prompt or "You are a construction AI that always responds with valid JSON."
                model = genai.GenerativeModel("gemini-1.5-flash", system_instruction=sys)
                response = model.generate_content(json_prompt)
                text = response.text.strip()
                if text.startswith("```"):
                    parts = text.split("```")
                    text = parts[1]
                    if text.startswith("json"):
                        text = text[4:]
                return json.loads(text.strip()), False

            elif settings.AI_PROVIDER == "openai":
                from openai import OpenAI
                client = OpenAI(api_key=settings.OPENAI_API_KEY)
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": system_prompt or "Respond only with valid JSON."},
                        {"role": "user", "content": json_prompt}
                    ],
                    response_format={"type": "json_object"},
                    max_tokens=2000
                )
                return json.loads(response.choices[0].message.content), False

        except Exception as e:
            logger.error(f"Structured JSON generation error: {e}")
            return None, True

        return None, True


ai_service = AIService()
