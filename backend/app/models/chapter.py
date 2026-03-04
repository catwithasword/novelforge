from sqlalchemy import Column, Integer, Text, Float, ForeignKey, DateTime, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(Integer, primary_key=True, index=True)
    story_id = Column(Integer, ForeignKey("stories.id"), nullable=False)
    chapter_num = Column(Integer, nullable=False)
    content = Column(Text, default="")
    debate_rounds = Column(Integer, default=0)
    critic_score = Column(Float, default=0.0)
    quality_report = Column(Text, default="")
    status = Column(String, default="draft")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    story = relationship("Story", back_populates="chapters")
    debate_logs = relationship("DebateLog", back_populates="chapter", cascade="all, delete-orphan")
