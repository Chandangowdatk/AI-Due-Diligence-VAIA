# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered due diligence platform that generates comprehensive company reports using Google Gemini and Tavily search. Monorepo with a FastAPI/Python backend and Next.js/TypeScript frontend.

## Development Commands

### Backend

```bash
# Install dependencies (from project root)
cd backend && uv sync --all-extras

# Run backend server (from project root)
python run_backend.py
# Or: cd backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run all tests
cd backend && uv run pytest

# Run a single test file
cd backend && uv run pytest tests/test_agents.py -v

# Run tests with coverage
cd backend && uv run pytest --cov=app --cov-report=html
```

### Frontend

```bash
cd frontend && npm install
cd frontend && npm run dev      # Dev server on :3000
cd frontend && npm run build    # Production build
cd frontend && npm run lint     # Next.js built-in linting
```

### Environment Setup

Copy `.env.example` to `.env` at project root (backend reads it). Copy `frontend/.env.example` to `frontend/.env.local`. Required keys: `GOOGLE_API_KEY`, `TAVILY_API_KEY`.

## Architecture

### Three-Phase Pipeline

Every report section is processed through three sequential agents:
1. **Research Agent** — LangGraph ReAct agent using Tavily search + document query tools. Runs 3 iterations (5 for Business Model).
2. **Data Extractor** — Extracts structured data from raw research text using Gemini with section-specific Pydantic schemas.
3. **Writer Agent** — Formats raw data into professional prose (no additional research).

The orchestrator (`backend/app/agents/orchestrator.py`) processes all 10 sections sequentially in a fixed order defined by `SECTION_ORDER`. Per-section timeout is 120s (180s for Business Model).

### Backend (FastAPI + LangChain)

- **Entry point**: `backend/app/main.py` — factory pattern via `create_app()` with async lifespan handler
- **Routes**: registered under `/api` prefix, split across `api/research.py`, `api/files.py`, `api/export.py` (combined in `api/routes.py`)
- **Configuration**: Pydantic Settings in `app/config.py`, loaded from `.env` with `@lru_cache` (restart required for env changes)
- **Storage**: in-memory dict (`storage/memory_store.py`) with JSON file persistence (`storage/file_persistence.py`). No database.
- **Models**: Pydantic v2 throughout. Section-specific data models in `models/sections.py`, enums in `models/enums.py`
- **Prompts**: all LLM prompts in `prompts/` directory — research, extraction, and writer prompts are separate files
- **Tools**: LangChain tools in `tools/` — Tavily search, document query (Gemini File API), think/validation tool

### Frontend (Next.js 14 App Router)

- **Pages**: `/` (landing), `/research` (search + upload form), `/report/[id]` (report viewer), `/report/[id]/print` (print layout)
- **API proxy**: Next.js rewrites `/api/*` to `http://localhost:8000/api/*` — the frontend never calls the backend directly
- **API client**: singleton class in `lib/api.ts` with typed methods for all endpoints
- **Polling**: `useResearchStatus` hook polls `/api/research/{id}/status` every 3s until complete/failed
- **Visualizations**: Recharts components in `components/visualizations/` (pie charts, bar charts, financial tables)
- **Styling**: Tailwind CSS with custom orange brand colors, dark mode via ThemeContext, glass-morphism effects

### Adding a New Report Section

1. Add enum value to `SectionId` in `backend/app/models/enums.py`
2. Add config to `SECTION_CONFIGS` in `backend/app/models/sections.py`
3. Add research prompt in `backend/app/prompts/research_prompts.py`
4. Add extraction prompt in `backend/app/prompts/extraction_prompts.py`
5. Add writer prompt in `backend/app/prompts/writer_prompts.py`
6. Add to `SECTION_ORDER` in `backend/app/agents/orchestrator.py`
7. Add section ID to frontend `SectionId` type in `frontend/src/types/report.ts`

### Key Patterns

- Section statuses flow: PENDING → RESEARCHING → WRITING → COMPLETE (or ERROR/TIMEOUT)
- Backend tests use `@patch()` with `AsyncMock` for LLM and Tavily mocking; fixtures in `tests/conftest.py`
- File uploads go through Gemini File API — documents are cached by Google for 48 hours
- LLM temperature varies by agent role: research=0.3, writer=0.4, extraction=0.1
