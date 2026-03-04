# NovelForge AI

**NovelForge AI** is a professional-grade, full-stack platform designed to guide writers from raw ideas to structured story bibles and fully generated, quality-checked novels.

## The Multi-Agent Debate Engine

Unlike simple LLM wrappers, NovelForge uses a **Layered Multi-Agent Pipeline** to ensure literary quality:

1.  **Writer Agent** (`llama-3.3-70b`): Generates raw chapter drafts based on the story bible and prior context.
2.  **Critic Agent** (`llama-3.3-70b`): Scores the draft (0–10) against the story bible, user settings, and plot consistency.
3.  **Arbiter Agent** (`llama-3.3-70b`): Reviews the draft and the critic's objections, then provides specific rewrite instructions if the score is below 7.

This process loops for a maximum of 3 rounds per chapter, ensuring every scene is polished and consistent.



## Tech Stack

### Frontend

- **Framework:** Next.js 15+ (App Router)
- **Runtime:** Bun
- **Styling:** TailwindCSS 4.0
- **Design:** Modern dark-theme with Glassmorphism and gradient accents.

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



## User Roles

- **Guest:** Landing page visibility and feature overview.
- **Author:** Full CRUD on stories, prototype generation, and chapter debate pipeline.
- **Admin:** Global oversight of users and content.



## Features

- **Interactive Story Wizard:** Define genre, world, characters, and tone.
- **Automated Story Bible:** AI builds a structured synopsis and chapter outline.
- **Quality Reports:** Every chapter includes a "Critic's Score" and debate logs.
- **Markdown Export:** Download your completed novel for external use.
