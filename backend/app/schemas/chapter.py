from pydantic import BaseModel
from typing import Optional


class ChapterGenerateRequest(BaseModel):
    chapter_num: int = 1


class ChapterResponse(BaseModel):
    id: int
    story_id: int
    chapter_num: int
    content: str
    debate_rounds: int
    critic_score: float
    quality_report: str
    status: str
    created_at: str | None = None

    class Config:
        from_attributes = True


class QualityReport(BaseModel):
    score: float
    rounds: int
    objections: list[str] = []
    final_verdict: str = ""


class DebateLogResponse(BaseModel):
    round_num: int
    writer_output: str
    critic_output: str
    arbiter_output: str

    class Config:
        from_attributes = True
