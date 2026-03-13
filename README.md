# NovelForge AI

**NovelForge AI** is a full-stack platform designed to guide writers from raw ideas to structured story bibles and fully generated novels.

## Background & Problem

Current AI writing tools often suffer from context drift and a lack of narrative cohesion. One-shot generation leads to inconsistent character behavior, repetitive prose, and plot holes. Professional and aspiring writers need a system that doesn't just write but authors—mimicking the iterative process of brainstorming, outlining, drafting, and rigorous editing.

## Objectives

- **Structural Integrity:** Ensure every chapter aligns with a pre-defined story bible.
- **Literary Quality:** Use a multi-agent debate process to refine drafts before the user ever sees them.
- **Consistency:** Maintain a persistent world-state and character logic throughout the entire manuscript.
- **Empowerment:** Provide writers with a creative co-pilot rather than a simple text generator.

## Scope

### In Scope

NovelForge AI focuses on the end-to-end novel creation process:

- **Conceptualization:** Transforming seeds of ideas into detailed world-building.
- **Outlining:** Automated generation of plot points and chapter beats.
- **Drafting:** Chapter generation using the Multi-Agent Debate Engine.

### Out of Scope

- **Final Formatting:** Professional typesetting (e.g., LaTeX, InDesign) is delegated to specialized software.
- **Distribution:** No built-in marketplace or direct-to-Kindle publishing features.
- **Graphic Design:** Cover art generation or interior illustrations are not supported.
- **Non-Fiction:** The platform is specifically optimized for narrative fiction and creative storytelling.

## Target Users & Roles

- **Guest:** Experience the landing page, view feature overviews, and understand the platform's value.
- **Author:** The primary user. Can create stories, manage Story Bibles, run the generation pipeline, and export manuscripts.
- **Admin:** Manages platform health, oversees user accounts, and monitors system performance.

## Core Features

- **Interactive Story Wizard:** Step-by-step guidance to define genre, world-rules, character arcs, and tone.
- **Automated Story Bible:** AI constructs a comprehensive database of your story's lore, characters, and plot structure.
- **Multi-Agent Debate Engine:** A pipeline (Writer, Critic, Arbiter) that self-corrects drafts to ensure high literary standards.
- **Quality Reports:** Comprehensive feedback for every chapter, including critics' scores and detailed debate logs.
- **Markdown Export:** Seamless transition from platform to professional editing software.

## System Workflow

1.  **Directives:** The user provides a prompt.
2.  **Forging the Bible:** The AI generates a Story Bible containing characters, locations, and a chapter-by-chapter outline.
3.  **The Debate Loop:**
    - **Writer Agent**: Generates a draft based on the Bible.
    - **Critic Agent**: Evaluates for consistency, tone, and pacing.
    - **Arbiter Agent**: Instructs the Writer to revise if the quality score is low.
4.  **Completion:** The user reviews the final polished draft and exports the manuscript.

<br/>

## Tech Stack

### Frontend

- **Framework:** Next.js 15+ (App Router)
- **Runtime:** Bun
- **Styling:** TailwindCSS 4.0

### Backend

- **Framework:** FastAPI
- **Package Manager:** uv
- **Database:** SQLAlchemy + SQLite (aiosqlite)
- **Auth:** JWT with Role-Based Access Control (Guest, Author, Admin)
- **LLM Integration:** OpenRouter API

## Project Structure

```text
novelforge/
├── backend/            # FastAPI + uv
│   ├── app/
│   │   ├── models/    # Database models
│   │   ├── schemas/   # Pydantic validation
│   │   ├── routers/   # API endpoints
│   │   ├── services/  # Business logic & Debate Engine
│   │   └── main.py    # Entry point
│   └── .env           # Backend config
└── frontend/           # Next.js + Bun
    ├── src/
    │   ├── app/       # UI Pages
    │   ├── lib/       # API client & types
    │   └── contexts/  # Auth state management
    └── .env.local     # Frontend config
```

## Getting Started

### 1. Prerequisites

- **Bun** installed
- **uv** installed
- **OpenRouter API Key** (for llama-3.3-70b)

### 2. Backend Setup

```bash
cd backend
# Environment config
cp .env.example .env
# Add your OPENROUTER_API_KEY to .env

# Run server
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

_The database will be initialized automatically on first run._

### 3. Frontend Setup

```bash
cd frontend
# Install dependencies
bun install

# Run dev server
bun run dev --port 3000
```

Visit [http://localhost:3000](http://localhost:3000).
