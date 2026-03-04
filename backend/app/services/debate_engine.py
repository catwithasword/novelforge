import json
import httpx
from dataclasses import dataclass
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.chapter import Chapter
from app.models.debate_log import DebateLog
from app.config import get_settings

settings = get_settings()

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


@dataclass
class CritiqueResult:
    score: float
    objections: list[str]
    raw_output: str


@dataclass
class ChapterResult:
    text: str
    score: float
    rounds: int
    quality_report: str


async def call_openrouter(system_prompt: str, user_prompt: str) -> str:
    """Call OpenRouter API with the given prompts."""
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.OPENROUTER_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "max_tokens": 4096,
                "temperature": 0.8,
            },
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


def build_writer_system_prompt() -> str:
    return """You are a skilled fiction writer. Your job is to write compelling, vivid, and well-structured novel chapters.

Rules:
- Write in prose, not bullet points
- Follow the story bible (characters, world, tone) exactly
- Respect the user's settings (POV, tone, chapter length)
- If given revision notes from a previous round, incorporate the specific feedback
- Maintain continuity with prior chapter summaries
- End chapters with a hook or natural transition point"""


def build_critic_system_prompt() -> str:
    return """You are a harsh but fair literary critic. You review chapter drafts against three criteria:

1. STORY BIBLE ALIGNMENT: Does the chapter match the characters, world, and tone defined in the prototype?
2. SETTINGS COMPLIANCE: Does it follow the user's POV, tone, and length preferences?
3. PLOT CONSISTENCY: Are there plot holes, character logic breaks, or unreasonable consequences?

You MUST respond in this exact JSON format:
{
    "score": <0-10>,
    "objections": ["objection 1", "objection 2", ...],
    "summary": "Brief overall assessment"
}

Score guide:
- 0-3: Major issues, needs complete rewrite
- 4-6: Significant problems, needs revision
- 7-8: Good quality, minor issues
- 9-10: Excellent, ready for reader"""


def build_arbiter_system_prompt() -> str:
    return """You are a wise editorial arbiter. You read a chapter draft and a critic's objections, then decide what specifically needs to be rewritten.

Your response should be clear, actionable revision notes for the writer. Be specific about:
- Which paragraphs or scenes need changes
- What exactly should be fixed or improved
- What should be kept as-is

Keep your notes concise and focused. The writer will use these to produce a revised draft."""


def build_writer_prompt(prototype: dict, user_settings: dict, prior_summaries: list[str],
                        chapter_num: int, revision_notes: str | None = None) -> str:
    prompt_parts = [
        f"## Story Bible\n{json.dumps(prototype, indent=2)}",
        f"\n## Writing Settings\n{json.dumps(user_settings, indent=2)}",
        f"\n## Chapter Number: {chapter_num}",
    ]

    if prior_summaries:
        prompt_parts.append(f"\n## Prior Chapter Summaries\n" + "\n".join(
            f"Chapter {i+1}: {s}" for i, s in enumerate(prior_summaries)
        ))

    if revision_notes:
        prompt_parts.append(f"\n## REVISION NOTES (from previous round)\n{revision_notes}")
        prompt_parts.append("\nPlease write a revised chapter incorporating the feedback above.")
    else:
        prompt_parts.append(f"\nPlease write Chapter {chapter_num}.")

    return "\n".join(prompt_parts)


def build_critic_prompt(draft: str, prototype: dict, user_settings: dict) -> str:
    return f"""## Story Bible
{json.dumps(prototype, indent=2)}

## Writing Settings
{json.dumps(user_settings, indent=2)}

## Chapter Draft to Review
{draft}

Review this chapter draft against the story bible and settings. Respond in the required JSON format."""


def build_arbiter_prompt(draft: str, critique_raw: str) -> str:
    return f"""## Chapter Draft
{draft}

## Critic's Review
{critique_raw}

Based on the critic's objections, provide specific revision notes for the writer."""


def parse_critique(raw: str) -> CritiqueResult:
    """Parse the critic's JSON response, with fallback."""
    try:
        # Try to extract JSON from the response
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start >= 0 and end > start:
            data = json.loads(raw[start:end])
            return CritiqueResult(
                score=float(data.get("score", 5)),
                objections=data.get("objections", []),
                raw_output=raw,
            )
    except (json.JSONDecodeError, ValueError, KeyError):
        pass
    # Fallback: assume mediocre score
    return CritiqueResult(score=5.0, objections=["Could not parse critique"], raw_output=raw)


class DebateEngine:
    MAX_ROUNDS = 3

    async def run(
        self,
        db: AsyncSession,
        story_id: int,
        chapter_num: int,
        prototype: dict,
        user_settings: dict,
        prior_summaries: list[str],
    ) -> Chapter:
        """Run the multi-agent debate pipeline for a single chapter."""
        # Create chapter record
        chapter = Chapter(
            story_id=story_id,
            chapter_num=chapter_num,
            status="generating",
        )
        db.add(chapter)
        await db.flush()
        await db.refresh(chapter)

        # Step 1: Initial draft
        writer_prompt = build_writer_prompt(prototype, user_settings, prior_summaries, chapter_num)
        draft = await call_openrouter(build_writer_system_prompt(), writer_prompt)

        final_critique = None
        rounds_completed = 0

        for round_num in range(1, self.MAX_ROUNDS + 1):
            rounds_completed = round_num

            # Step 2: Critic reviews
            critic_prompt = build_critic_prompt(draft, prototype, user_settings)
            critic_raw = await call_openrouter(build_critic_system_prompt(), critic_prompt)
            critique = parse_critique(critic_raw)
            final_critique = critique

            if critique.score >= 7:
                # Log the final approved round
                log = DebateLog(
                    chapter_id=chapter.id,
                    round_num=round_num,
                    writer_output=draft,
                    critic_output=critic_raw,
                    arbiter_output="APPROVED — score >= 7",
                )
                db.add(log)
                break

            # Step 3: Arbiter decides what to fix
            arbiter_prompt = build_arbiter_prompt(draft, critic_raw)
            arbiter_output = await call_openrouter(build_arbiter_system_prompt(), arbiter_prompt)

            # Log this round
            log = DebateLog(
                chapter_id=chapter.id,
                round_num=round_num,
                writer_output=draft,
                critic_output=critic_raw,
                arbiter_output=arbiter_output,
            )
            db.add(log)

            # Step 4: Writer revises
            if round_num < self.MAX_ROUNDS:
                revision_prompt = build_writer_prompt(
                    prototype, user_settings, prior_summaries,
                    chapter_num, revision_notes=arbiter_output,
                )
                draft = await call_openrouter(build_writer_system_prompt(), revision_prompt)

        # Build quality report
        quality_report = json.dumps({
            "final_score": final_critique.score if final_critique else 0,
            "rounds": rounds_completed,
            "objections": final_critique.objections if final_critique else [],
            "verdict": "approved" if (final_critique and final_critique.score >= 7) else "max_rounds_reached",
        })

        # Update chapter
        chapter.content = draft
        chapter.debate_rounds = rounds_completed
        chapter.critic_score = final_critique.score if final_critique else 0
        chapter.quality_report = quality_report
        chapter.status = "completed"
        await db.flush()
        await db.refresh(chapter)

        return chapter


debate_engine = DebateEngine()
