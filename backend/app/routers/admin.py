from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.dependencies import require_role
from app.models.user import User, UserRole
from app.models.story import Story
from app.models.chapter import Chapter
from app.schemas.admin import AdminUserResponse, AdminStoryResponse

router = APIRouter(prefix="/admin", tags=["Admin"])

admin_guard = require_role(UserRole.ADMIN)


@router.get("/users", response_model=list[AdminUserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_guard),
):
    result = await db.execute(
        select(User, func.count(Story.id).label("story_count"))
        .outerjoin(Story, Story.user_id == User.id)
        .group_by(User.id)
        .order_by(User.created_at.desc())
    )
    return [
        AdminUserResponse(
            id=user.id,
            email=user.email,
            role=user.role.value,
            created_at=str(user.created_at) if user.created_at else None,
            story_count=story_count,
        )
        for user, story_count in result.all()
    ]


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_guard),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(user)
    await db.flush()


@router.get("/stories", response_model=list[AdminStoryResponse])
async def list_all_stories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_guard),
):
    result = await db.execute(
        select(Story, User.email, func.count(Chapter.id).label("chapter_count"))
        .join(User, User.id == Story.user_id)
        .outerjoin(Chapter, Chapter.story_id == Story.id)
        .group_by(Story.id, User.email)
        .order_by(Story.created_at.desc())
    )
    return [
        AdminStoryResponse(
            id=story.id,
            user_id=story.user_id,
            author_email=email,
            title=story.title,
            status=story.status,
            chapter_count=chapter_count,
            created_at=str(story.created_at) if story.created_at else None,
        )
        for story, email, chapter_count in result.all()
    ]
