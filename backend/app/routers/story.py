import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, UserRole
from app.schemas.story import StoryCreateRequest, StoryUpdateRequest, StoryResponse, PrototypeResponse
from app.services import story_service
from app.services.debate_engine import call_openrouter

router = APIRouter(prefix="/story", tags=["Stories"])


PROTOTYPE_SYSTEM_PROMPT = """You are a story architect. Given a user's story context (genre, characters, world, themes), generate a structured story bible / prototype in JSON format:

{
    "synopsis": "Brief story synopsis (2-3 paragraphs)",
    "characters": [
        {"name": "...", "role": "protagonist/antagonist/supporting", "description": "...", "arc": "..."}
    ],
    "world": "World building description",
    "themes": ["theme1", "theme2"],
    "tone": "Overall story tone",
    "act_structure": [
        {"act": 1, "summary": "Setup..."},
        {"act": 2, "summary": "Rising action..."},
        {"act": 3, "summary": "Resolution..."}
    ],
    "chapter_outline": [
        {"chapter": 1, "title": "...", "summary": "..."}
    ]
}

Make the story bible rich and detailed. The chapter outline should have 5-10 chapters."""


@router.post("", response_model=StoryResponse, status_code=status.HTTP_201_CREATED)
async def create_story(
    req: StoryCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    story = await story_service.create_story(db, current_user.id, req.title, req.context, req.settings)
    return StoryResponse(
        id=story.id,
        user_id=story.user_id,
        title=story.title,
        context_json=story.context_json,
        prototype_json=story.prototype_json,
        settings_json=story.settings_json,
        status=story.status,
        created_at=str(story.created_at) if story.created_at else None,
        chapter_count=0,
    )


@router.get("", response_model=list[StoryResponse])
async def list_stories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stories = await story_service.get_user_stories(db, current_user.id)
    return stories


@router.get("/{story_id}", response_model=StoryResponse)
async def get_story(
    story_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    story = await story_service.get_story_by_id(db, story_id, current_user.id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    chapters = await story_service.get_story_chapters(db, story_id)
    return StoryResponse(
        id=story.id,
        user_id=story.user_id,
        title=story.title,
        context_json=story.context_json,
        prototype_json=story.prototype_json,
        settings_json=story.settings_json,
        status=story.status,
        created_at=str(story.created_at) if story.created_at else None,
        chapter_count=len(chapters),
    )


@router.put("/{story_id}", response_model=StoryResponse)
async def update_story(
    story_id: int,
    req: StoryUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    story = await story_service.get_story_by_id(db, story_id, current_user.id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    kwargs = {}
    if req.title is not None:
        kwargs["title"] = req.title
    if req.context is not None:
        kwargs["context_json"] = req.context
    if req.settings is not None:
        kwargs["settings_json"] = req.settings
    if req.prototype is not None:
        kwargs["prototype_json"] = req.prototype
    story = await story_service.update_story(db, story, **kwargs)
    chapters = await story_service.get_story_chapters(db, story_id)
    return StoryResponse(
        id=story.id,
        user_id=story.user_id,
        title=story.title,
        context_json=story.context_json,
        prototype_json=story.prototype_json,
        settings_json=story.settings_json,
        status=story.status,
        created_at=str(story.created_at) if story.created_at else None,
        chapter_count=len(chapters),
    )


@router.delete("/{story_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_story_endpoint(
    story_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    story = await story_service.get_story_by_id(db, story_id, current_user.id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    await story_service.delete_story(db, story)


@router.post("/{story_id}/prototype", response_model=PrototypeResponse)
async def generate_prototype(
    story_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    story = await story_service.get_story_by_id(db, story_id, current_user.id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    context = story.context_json or {}
    user_prompt = f"Generate a story bible for the following concept:\n{json.dumps(context, indent=2)}"

    raw = await call_openrouter(PROTOTYPE_SYSTEM_PROMPT, user_prompt)

    # Try to parse JSON from the response
    try:
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start >= 0 and end > start:
            prototype = json.loads(raw[start:end])
        else:
            prototype = {"raw": raw}
    except json.JSONDecodeError:
        prototype = {"raw": raw}

    story = await story_service.update_story(db, story, prototype_json=prototype, status="prototype_ready")
    return PrototypeResponse(story_id=story.id, prototype=prototype)
