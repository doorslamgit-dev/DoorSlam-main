# ai-tutor-api/src/services/embedder.py
# Batch embedding generation using OpenAI text-embedding-3-small.

import logging

from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

from ..config import settings

logger = logging.getLogger(__name__)

BATCH_SIZE = 100


def _get_client() -> AsyncOpenAI:
    """Create an async OpenAI client for embeddings."""
    api_key = settings.embedding_api_key or settings.openai_api_key
    return AsyncOpenAI(
        api_key=api_key,
        base_url=settings.embedding_base_url,
    )


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    reraise=True,
)
async def _embed_batch(client: AsyncOpenAI, texts: list[str]) -> list[list[float]]:
    """Embed a single batch of texts with retry logic."""
    response = await client.embeddings.create(
        model=settings.embedding_model,
        input=texts,
        dimensions=settings.embedding_dimensions,
    )
    return [item.embedding for item in response.data]


async def embed_chunks(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a list of text chunks.

    Processes in batches of BATCH_SIZE to stay within API limits.
    Returns a list of embedding vectors in the same order as input texts.
    """
    if not texts:
        return []

    client = _get_client()
    all_embeddings: list[list[float]] = []

    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i : i + BATCH_SIZE]
        logger.info("Embedding batch %d-%d of %d texts", i, i + len(batch), len(texts))
        embeddings = await _embed_batch(client, batch)
        all_embeddings.extend(embeddings)

    return all_embeddings


async def embed_query(text: str) -> list[float]:
    """Embed a single query string. Convenience wrapper for retrieval."""
    results = await embed_chunks([text])
    return results[0]
