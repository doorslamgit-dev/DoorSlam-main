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

    # Chat LLM (defaults to OpenAI direct — fast, reliable)
    chat_api_key: str = ""
    chat_base_url: str = "https://api.openai.com/v1"
    chat_model: str = "gpt-4o-mini"

    # Embedding (defaults to OpenAI direct — fast query embedding)
    embedding_api_key: str = ""
    embedding_base_url: str = "https://api.openai.com/v1"
    embedding_model: str = "text-embedding-3-large"
    embedding_dimensions: int = 2000

    # Chunking
    chunk_size: int = 512
    chunk_overlap: int = 64

    # Response
    max_response_tokens: int = 400

    # Retrieval
    retrieval_match_count: int = 5
    retrieval_similarity_threshold: float = 0.2
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
