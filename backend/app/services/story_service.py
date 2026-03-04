from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.models.story import Story
from app.models.chapter import Chapter
from app.models.user import User


async def create_story(db: AsyncSession, user_id: int, title: str, context: dict, settings: dict) -> Story:
    story = Story(
        user_id=user_id,
        title=title,
        context_json=context,
        settings_json=settings,
        status="draft",
    )
    db.add(story)
    await db.flush()
    await db.refresh(story)
    return story


async def get_user_stories(db: AsyncSession, user_id: int) -> list[dict]:
    result = await db.execute(
        select(Story, func.count(Chapter.id).label("chapter_count"))
        .outerjoin(Chapter, Chapter.story_id == Story.id)
        .where(Story.user_id == user_id)
        .group_by(Story.id)
        .order_by(Story.created_at.desc())
    )
    stories = []
    for story, chapter_count in result.all():
        stories.append({
            "id": story.id,
            "user_id": story.user_id,
            "title": story.title,
            "context_json": story.context_json,
            "prototype_json": story.prototype_json,
            "settings_json": story.settings_json,
            "status": story.status,
            "created_at": str(story.created_at) if story.created_at else None,
            "chapter_count": chapter_count,
        })
    return stories


async def get_story_by_id(db: AsyncSession, story_id: int, user_id: int | None = None) -> Story | None:
    query = select(Story).where(Story.id == story_id)
    if user_id is not None:
        query = query.where(Story.user_id == user_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def update_story(db: AsyncSession, story: Story, **kwargs) -> Story:
    for key, value in kwargs.items():
        if value is not None and hasattr(story, key):
            setattr(story, key, value)
    await db.flush()
    await db.refresh(story)
    return story


async def delete_story(db: AsyncSession, story: Story):
    await db.delete(story)
    await db.flush()


async def get_story_chapters(db: AsyncSession, story_id: int) -> list[Chapter]:
    result = await db.execute(
        select(Chapter)
        .where(Chapter.story_id == story_id)
        .order_by(Chapter.chapter_num)
    )
    return list(result.scalars().all())
