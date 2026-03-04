from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Story(Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    context_json = Column(JSON, default=dict)
    prototype_json = Column(JSON, default=dict)
    settings_json = Column(JSON, default=dict)
    status = Column(String, default="draft")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    author = relationship("User", back_populates="stories")
    chapters = relationship("Chapter", back_populates="story", cascade="all, delete-orphan")
