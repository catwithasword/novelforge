from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class DebateLog(Base):
    __tablename__ = "debate_logs"

    id = Column(Integer, primary_key=True, index=True)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=False)
    round_num = Column(Integer, nullable=False)
    writer_output = Column(Text, default="")
    critic_output = Column(Text, default="")
    arbiter_output = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    chapter = relationship("Chapter", back_populates="debate_logs")
