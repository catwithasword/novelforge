from pydantic import BaseModel
from typing import Optional


class StoryCreateRequest(BaseModel):
    title: str
    context: dict = {}
    settings: dict = {}


class StoryUpdateRequest(BaseModel):
    title: Optional[str] = None
    context: Optional[dict] = None
    settings: Optional[dict] = None
    prototype: Optional[dict] = None


class StoryResponse(BaseModel):
    id: int
    user_id: int
    title: str
    context_json: dict | None = None
    prototype_json: dict | None = None
    settings_json: dict | None = None
    status: str
    created_at: str | None = None
    chapter_count: int = 0

    class Config:
        from_attributes = True


class PrototypeRequest(BaseModel):
    """Request body for generating a story prototype/bible."""
    pass


class PrototypeResponse(BaseModel):
    story_id: int
    prototype: dict
