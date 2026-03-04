from pydantic import BaseModel


class AdminUserResponse(BaseModel):
    id: int
    email: str
    role: str
    created_at: str | None = None
    story_count: int = 0

    class Config:
        from_attributes = True


class AdminStoryResponse(BaseModel):
    id: int
    user_id: int
    author_email: str = ""
    title: str
    status: str
    chapter_count: int = 0
    created_at: str | None = None

    class Config:
        from_attributes = True
