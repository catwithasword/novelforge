from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.chapter import Chapter
from app.models.debate_log import DebateLog
from app.schemas.chapter import ChapterGenerateRequest, ChapterResponse, DebateLogResponse
from app.services import story_service
from app.services.debate_engine import debate_engine

router = APIRouter(prefix="/story/{story_id}/chapter", tags=["Chapters"])


@router.post("", response_model=ChapterResponse)
async def generate_chapter(
    story_id: int,
    req: ChapterGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    story = await story_service.get_story_by_id(db, story_id, current_user.id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    if not story.prototype_json:
        raise HTTPException(status_code=400, detail="Generate a prototype first")

    # Gather prior chapter summaries for continuity
    existing_chapters = await story_service.get_story_chapters(db, story_id)
    prior_summaries = []
    for ch in existing_chapters:
        if ch.chapter_num < req.chapter_num and ch.content:
            # Use first 200 chars as summary
            prior_summaries.append(ch.content[:200] + "...")

    # Run the debate engine
    chapter = await debate_engine.run(
        db=db,
        story_id=story_id,
        chapter_num=req.chapter_num,
        prototype=story.prototype_json,
        user_settings=story.settings_json or {},
        prior_summaries=prior_summaries,
    )

    # Update story status
    await story_service.update_story(db, story, status="in_progress")

    return ChapterResponse(
        id=chapter.id,
        story_id=chapter.story_id,
        chapter_num=chapter.chapter_num,
        content=chapter.content,
        debate_rounds=chapter.debate_rounds,
        critic_score=chapter.critic_score,
        quality_report=chapter.quality_report,
        status=chapter.status,
        created_at=str(chapter.created_at) if chapter.created_at else None,
    )


@router.get("", response_model=list[ChapterResponse])
async def list_chapters(
    story_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    story = await story_service.get_story_by_id(db, story_id, current_user.id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    chapters = await story_service.get_story_chapters(db, story_id)
    return [
        ChapterResponse(
            id=ch.id,
            story_id=ch.story_id,
            chapter_num=ch.chapter_num,
            content=ch.content,
            debate_rounds=ch.debate_rounds,
            critic_score=ch.critic_score,
            quality_report=ch.quality_report or "",
            status=ch.status,
            created_at=str(ch.created_at) if ch.created_at else None,
        )
        for ch in chapters
    ]


@router.get("/{chapter_id}/debate-logs", response_model=list[DebateLogResponse])
async def get_debate_logs(
    story_id: int,
    chapter_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    story = await story_service.get_story_by_id(db, story_id, current_user.id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    result = await db.execute(
        select(DebateLog)
        .where(DebateLog.chapter_id == chapter_id)
        .order_by(DebateLog.round_num)
    )
    logs = result.scalars().all()
    return [
        DebateLogResponse(
            round_num=log.round_num,
            writer_output=log.writer_output,
            critic_output=log.critic_output,
            arbiter_output=log.arbiter_output,
        )
        for log in logs
    ]
