from pydantic_settings import BaseSettings
from typing import Optional, List

class Settings(BaseSettings):
    APP_ENV: str = "development"
    SECRET_KEY: str = "dev-secret-key"
    DATABASE_URL: str = "sqlite:///./constructiq.db"
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 20
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    AI_PROVIDER: str = "gemini"
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None

    WEATHER_API_KEY: Optional[str] = None
    WEATHER_PROVIDER: str = "openweathermap"

    DEMO_MODE: bool = True

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    @property
    def ai_available(self) -> bool:
        if self.AI_PROVIDER == "gemini":
            return bool(self.GEMINI_API_KEY)
        if self.AI_PROVIDER == "openai":
            return bool(self.OPENAI_API_KEY)
        return False

    @property
    def weather_available(self) -> bool:
        return bool(self.WEATHER_API_KEY)

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
