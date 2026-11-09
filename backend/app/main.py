from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import get_settings
from .database import init_db
from .routes import admin, auth, hobbies, learning_interactions, students, revision, learning, progress

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Phase 1 MVP for revision, basic IT/coding lessons, and spiritual lessons for Grade 5-7 learners.",
)

origins = [origin.strip() for origin in settings.allowed_origins.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    openai_configured = bool(settings.openai_api_key and not settings.openai_api_key.startswith("replace"))
    ai_mode = "mock" if settings.mock_ai_mode or not openai_configured else "openai"
    mock_reason = None
    if settings.mock_ai_mode:
        mock_reason = "MOCK_AI_MODE or USE_MOCK_AI is enabled"
    elif not openai_configured:
        mock_reason = "OPENAI_API_KEY is missing or still using a placeholder value"

    return {
        "status": "healthy",
        "service": "digital-kids-learning-api",
        "ai_mode": ai_mode,
        "openai_configured": openai_configured,
        "openai_model": settings.openai_model,
        "mock_reason": mock_reason,
    }


app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(students.router)
app.include_router(revision.router)
app.include_router(learning.router)
app.include_router(hobbies.router)
app.include_router(learning_interactions.router)
app.include_router(progress.router)
