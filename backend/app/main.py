from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routers import auth, story, chapter, export, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="NovelForge AI",
    description="AI-powered novel generation platform with multi-LLM debate engine",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(story.router)
app.include_router(chapter.router)
app.include_router(export.router)
app.include_router(admin.router)


@app.get("/")
async def root():
    return {"message": "NovelForge AI API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}
