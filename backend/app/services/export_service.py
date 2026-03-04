import json
from app.models.story import Story
from app.models.chapter import Chapter


def export_story_markdown(story: Story, chapters: list[Chapter]) -> str:
    """Export a story and its chapters as a Markdown document."""
    lines = []
    lines.append(f"# {story.title}")
    lines.append("")

    # Story bible / prototype
    if story.prototype_json:
        proto = story.prototype_json
        if isinstance(proto, str):
            proto = json.loads(proto)

        if proto.get("synopsis"):
            lines.append("## Synopsis")
            lines.append(proto["synopsis"])
            lines.append("")

        if proto.get("characters"):
            lines.append("## Characters")
            for char in proto["characters"]:
                if isinstance(char, dict):
                    lines.append(f"- **{char.get('name', 'Unknown')}**: {char.get('description', '')}")
                else:
                    lines.append(f"- {char}")
            lines.append("")

        if proto.get("world"):
            lines.append("## World")
            lines.append(proto["world"])
            lines.append("")

    lines.append("---")
    lines.append("")

    # Chapters
    for chapter in chapters:
        lines.append(f"## Chapter {chapter.chapter_num}")
        lines.append("")
        lines.append(chapter.content or "*No content yet*")
        lines.append("")
        lines.append("---")
        lines.append("")

    return "\n".join(lines)
