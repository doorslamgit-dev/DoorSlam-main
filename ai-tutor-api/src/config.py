# ai-tutor-api/src/config.py

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Load .env into os.environ so third-party SDKs (LangSmith, etc.) can read their vars
load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    supabase_url: str
    supabase_service_role_key: str
    supabase_jwt_secret: str

    # LLM provider (OpenRouter — OpenAI-compatible API)
    openrouter_api_key: str = ""
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    chat_model: str = "z-ai/glm-4.7"

    # Embedding (via OpenRouter)
    embedding_model: str = "qwen/qwen3-embedding-8b"
    embedding_dimensions: int = 2000

    # Chunking
    chunk_size: int = 512
    chunk_overlap: int = 64

    # Retrieval
    retrieval_match_count: int = 5
    retrieval_similarity_threshold: float = 0.7
    max_history_tokens: int = 4000

    # Google Drive (OAuth2)
    google_client_id: str = ""
    google_client_secret: str = ""
    google_refresh_token: str = ""

    cors_origins: str = "http://localhost:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        """Split comma-separated CORS_ORIGINS string into a list."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()  # type: ignore[call-arg]
