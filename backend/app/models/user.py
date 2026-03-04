import enum
from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class UserRole(str, enum.Enum):
    GUEST = "guest"
    AUTHOR = "author"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.AUTHOR, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    stories = relationship("Story", back_populates="author", cascade="all, delete-orphan")
