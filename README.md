# AI-Powered Due Diligence Platform

An intelligent platform that generates comprehensive due diligence reports on companies using AI agents powered by Google Gemini and Tavily search.

## Features

- **10 Comprehensive Report Sections**: Executive Summary, Company Overview, Leadership & Governance, Business Model, Market & Industry, Competitive Landscape, Financial Analysis, Operations, Risks & Mitigants, ESG Analysis
- **Real-time Progress Tracking**: Watch as each section is researched and written
- **Interactive Visualizations**: Recharts-powered charts for ownership, funding, revenue, and financials
- **Source Citations**: All information is sourced and verifiable
- **Export Options**: Download reports as PDF or JSON
- **Public/Private Company Support**: Prioritizes SEC filings for public companies

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API   │────▶│   AI Agents     │
│   (Next.js)     │◀────│   (FastAPI)     │◀────│   (LangChain)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Tavily Search  │
                                               │  Google Gemini  │
                                               └─────────────────┘
```

### Three-Phase Data Processing

1. **Research Agent**: Gathers raw data using Tavily search with iterative refinement
2. **Data Extractor**: Extracts structured data and generates visualization data
3. **Writer Agent**: Formats content professionally (no additional research)

## Quick Start

### Prerequisites

- Python 3.11+
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- Node.js 18+
- Google AI API Key (Gemini 2.5 Pro)
- Tavily API Key

### Backend Setup

```bash
cd backend

# Install dependencies with uv
uv sync --all-extras

# Copy environment file and add your API keys
cp .env.example .env
# Edit .env with your GOOGLE_API_KEY and TAVILY_API_KEY

# Run the server
uv run uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Run development server
npm run dev
```

### Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Environment Variables

### Backend (.env)

```env
GOOGLE_API_KEY=your_google_api_key
TAVILY_API_KEY=your_tavily_api_key
FRONTEND_URL=http://localhost:3000
DEBUG=false
LOG_LEVEL=INFO
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/research` | Start new research |
| GET | `/api/research/{id}/status` | Get research status (poll every 3s) |
| GET | `/api/research/{id}/section/{section_id}` | Get section content |
| GET | `/api/research/{id}/report` | Get full report |
| GET | `/api/research/{id}/export/json` | Export as JSON |
| GET | `/api/research/{id}/export/pdf` | Export as PDF |

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── agents/          # AI agents (research, writer, extractor)
│   │   ├── api/             # FastAPI endpoints
│   │   ├── models/          # Pydantic models
│   │   ├── prompts/         # LLM prompts
│   │   ├── services/        # Business logic
│   │   ├── storage/         # Data persistence
│   │   ├── tools/           # LangChain tools
│   │   └── utils/           # Utilities
│   └── tests/               # Backend tests
├── frontend/
│   └── src/
│       ├── app/             # Next.js pages
│       ├── components/      # React components
│       ├── hooks/           # Custom hooks
│       ├── lib/             # Utilities
│       └── types/           # TypeScript types
└── .kiro/specs/             # Feature specifications
```

## Running Tests

```bash
# Backend tests
cd backend
uv run pytest

# With coverage
uv run pytest --cov=app --cov-report=html
```

## Development

### Adding a New Section

1. Add section ID to `backend/app/models/enums.py`
2. Create section config in `backend/app/models/sections.py`
3. Add research prompt in `backend/app/prompts/research_prompts.py`
4. Update frontend types in `frontend/src/types/report.ts`
5. Add visualization component if needed

### Customizing Prompts

Research and writing prompts are in `backend/app/prompts/`. Each section has specific instructions for:
- What data to gather
- How to format the output
- What visualizations to generate

## License

MIT
