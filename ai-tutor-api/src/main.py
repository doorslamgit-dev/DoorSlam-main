# ai-tutor-api/src/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .api.chat import router as chat_router
from .api.conversations import router as conversations_router

app = FastAPI(
    title="Doorslam AI Tutor API",
    version="0.1.0",
    redirect_slashes=False,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/chat", tags=["chat"])
app.include_router(conversations_router, prefix="/conversations", tags=["conversations"])


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}
