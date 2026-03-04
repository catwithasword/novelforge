from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.services import story_service
from app.services.export_service import export_story_markdown

router = APIRouter(prefix="/story/{story_id}/export", tags=["Export"])


@router.get("", response_class=PlainTextResponse)
async def export_story(
    story_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    story = await story_service.get_story_by_id(db, story_id, current_user.id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    chapters = await story_service.get_story_chapters(db, story_id)
    markdown = export_story_markdown(story, chapters)

    return PlainTextResponse(
        content=markdown,
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{story.title}.md"'},
    )
