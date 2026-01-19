# AI-Powered Due Diligence Platform

An intelligent platform that generates comprehensive due diligence reports on companies using AI agents powered by Google Gemini and Tavily search. Upload company documents or let the AI research from the web to create detailed, professional reports with interactive visualizations.

## Features

### Core Capabilities
- **10 Comprehensive Report Sections**: Executive Summary, Company Overview, Leadership & Governance, Business Model, Market & Industry, Competitive Landscape, Financial Analysis, Operations, Risks & Mitigants, ESG Analysis
- **Document Upload & Processing**: Upload PDFs, PowerPoints, Excel, Word documents (up to 20MB) for AI-powered analysis using Google Gemini File API
- **Web Research**: Automated research using Tavily search with iterative refinement for comprehensive data gathering
- **Real-time Progress Tracking**: Watch as each section is researched and written with live status updates
- **Interactive Visualizations**: Dynamic charts for ownership structure, funding rounds, revenue breakdown, and financial metrics
- **Source Citations**: All information is sourced and verifiable with clickable references
- **Export Options**: Download reports as PDF or JSON
- **Public/Private Company Support**: Intelligent prioritization of SEC filings for public companies

### Technical Highlights
- **Three-Phase Processing Pipeline**: Research → Extract → Write for optimal data quality
- **Multi-Agent Architecture**: Specialized agents for research, data extraction, and content writing
- **Gemini 2.5 Pro Integration**: Advanced AI capabilities for document understanding and content generation
- **Responsive UI**: Modern Next.js frontend with Tailwind CSS and dark mode support

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API   │────▶│   AI Agents     │
│   (Next.js)     │◀────│   (FastAPI)     │◀────│   (LangChain)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │                        │
                                │                        ▼
                                │               ┌─────────────────┐
                                │               │  Tavily Search  │
                                │               │  Google Gemini  │
                                │               └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Gemini File    │
                       │  API (Docs)     │
                       └─────────────────┘
```

### Three-Phase Data Processing Pipeline

1. **Research Agent**: Gathers raw data using Tavily search and uploaded documents with iterative refinement (3-5 iterations)
2. **Data Extractor**: Extracts structured data and generates visualization-ready datasets
3. **Writer Agent**: Formats content professionally with proper markdown structure (no additional research)

## Quick Start

### Prerequisites

- **Python 3.11+** (recommended: 3.11 or 3.12)
- **[uv](https://docs.astral.sh/uv/)** - Fast Python package manager (replaces pip/poetry)
- **Node.js 18+** and npm
- **Google AI API Key** - Get from [Google AI Studio](https://aistudio.google.com/app/apikey) (Gemini 2.5 Pro access required)
- **Tavily API Key** - Get from [Tavily](https://tavily.com/) (free tier available)

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd vaia-due-diligence
```

#### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install uv if not already installed
# macOS/Linux:
curl -LsSf https://astral.sh/uv/install.sh | sh
# Windows:
# powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Install dependencies
uv sync --all-extras

# Copy environment file
cp ../.env.example ../.env

# Edit .env and add your API keys:
# GOOGLE_API_KEY=your_google_api_key_here
# TAVILY_API_KEY=your_tavily_api_key_here
```

#### 3. Frontend Setup

```bash
# Navigate to frontend (from project root)
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# The default API URL (http://localhost:8000) should work out of the box
```

### Running the Application

#### Start Backend Server

```bash
# From project root
python run_backend.py

# Or from backend directory:
cd backend
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at:
- API: http://localhost:8000
- Interactive API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

#### Start Frontend Development Server

```bash
# From frontend directory
cd frontend
npm run dev
```

Frontend will be available at: http://localhost:3000

## Usage Guide

### Creating a Due Diligence Report

1. **Navigate to Home Page** (http://localhost:3000)
2. **Enter Company Name** in the search bar
3. **Select Company Type**:
   - Public Company (prioritizes SEC filings)
   - Private Company (focuses on web research)
4. **Upload Documents** (Optional):
   - Drag & drop or click to upload
   - Supported formats: PDF, PPT, PPTX, CSV, XLSX, XLS, DOC, DOCX
   - Max file size: 20MB per file
5. **Click "Generate Report"**
6. **Monitor Progress**: Watch real-time updates as each section is processed
7. **View Report**: Navigate through sections using the sidebar
8. **Export**: Download as PDF or JSON

### Report Sections

Each report includes 10 comprehensive sections:

1. **Executive Summary** - High-level overview and key findings
2. **Company Overview** - History, mission, products/services
3. **Leadership & Governance** - Management team, board structure, ownership
4. **Business Model** - Revenue streams, pricing, customer segments
5. **Market & Industry** - Market size, trends, positioning
6. **Competitive Landscape** - Key competitors, market share, differentiation
7. **Financial Analysis** - Revenue, profitability, funding history
8. **Operations** - Infrastructure, technology, partnerships
9. **Risks & Mitigants** - Key risks and mitigation strategies
10. **ESG Analysis** - Environmental, social, and governance factors

## Environment Variables

### Backend (.env)

```env
# Required API Keys
GOOGLE_API_KEY=your_google_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=true
LOG_LEVEL=INFO

# Frontend URL (for CORS and PDF export)
FRONTEND_URL=http://localhost:3000

# Storage
DATA_DIR=./backend/data/reports

# LLM Configuration
GEMINI_MODEL=gemini-2.5-pro
RESEARCH_TEMPERATURE=0.3
WRITER_TEMPERATURE=0.4
EXTRACTION_TEMPERATURE=0.1

# Timeouts & Limits
SECTION_TIMEOUT_SECONDS=120
MAX_SEARCH_ITERATIONS=3
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API Reference

### Research Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/research` | Start new research with company name and optional documents |
| GET | `/api/research/{id}/status` | Get research status (poll every 3s for updates) |
| GET | `/api/research/{id}/section/{section_id}` | Get specific section content |
| GET | `/api/research/{id}/report` | Get complete report with all sections |

### File Upload Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/files/upload` | Upload a single document (returns Gemini file reference) |

### Export Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/research/{id}/export/json` | Export report as JSON |
| GET | `/api/research/{id}/export/pdf` | Export report as PDF |

### Example: Start Research

```bash
curl -X POST "http://localhost:8000/api/research" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Tesla Inc",
    "is_public": true,
    "region": "USA",
    "gemini_file_names": []
  }'
```

Response:
```json
{
  "research_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "Research started"
}
```

## Project Structure

```
vaia-due-diligence/
├── backend/
│   ├── app/
│   │   ├── agents/              # AI agent implementations
│   │   │   ├── orchestrator.py  # Main coordination logic
│   │   │   ├── research_agent.py
│   │   │   ├── data_extractor.py
│   │   │   └── writer_agent.py
│   │   ├── api/                 # FastAPI route handlers
│   │   │   ├── research.py      # Research endpoints
│   │   │   ├── files.py         # File upload endpoints
│   │   │   └── export.py        # Export endpoints
│   │   ├── models/              # Pydantic data models
│   │   │   ├── schemas.py       # Core data structures
│   │   │   ├── enums.py         # Enumerations
│   │   │   └── sections.py      # Section configurations
│   │   ├── prompts/             # LLM prompt templates
│   │   │   ├── research_prompts.py
│   │   │   ├── extraction_prompts.py
│   │   │   └── writer_prompts.py
│   │   ├── services/            # Business logic
│   │   │   ├── gemini_files.py  # Document upload handling
│   │   │   ├── pdf_generator.py # PDF export
│   │   │   └── source_prioritizer.py
│   │   ├── storage/             # Data persistence
│   │   │   ├── memory_store.py  # In-memory storage
│   │   │   └── file_persistence.py
│   │   ├── tools/               # LangChain tools
│   │   │   ├── tavily_tool.py   # Web search
│   │   │   ├── document_query_tool.py
│   │   │   └── think_tool.py
│   │   └── utils/               # Utilities
│   │       ├── logging.py
│   │       ├── retry.py
│   │       └── tokens.py
│   ├── data/                    # Runtime data storage
│   │   └── reports/
│   ├── tests/                   # Test suite
│   └── main.py                  # Application entry point
├── frontend/
│   └── src/
│       ├── app/                 # Next.js app router pages
│       │   ├── page.tsx         # Home/search page
│       │   ├── research/        # Research progress page
│       │   └── report/[id]/     # Report view page
│       ├── components/          # React components
│       │   ├── report/          # Report display components
│       │   ├── search/          # Search interface
│       │   ├── ui/              # UI primitives
│       │   └── visualizations/  # Chart components
│       ├── hooks/               # Custom React hooks
│       │   ├── useResearchStatus.ts
│       │   ├── useSectionContent.ts
│       │   └── useExport.ts
│       ├── lib/                 # Utilities
│       │   ├── api.ts           # API client
│       │   └── utils.ts
│       ├── types/               # TypeScript definitions
│       │   ├── api.ts
│       │   ├── report.ts
│       │   └── visualizations.ts
│       └── styles/              # Global styles
│           ├── globals.css
│           └── print.css
├── data/                        # Development data
│   ├── uploads/                 # Uploaded documents
│   ├── processed_documents/     # Processed markdown
│   └── reports/                 # Generated reports
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── pyproject.toml               # Python dependencies
├── requirements.txt             # Pip requirements
├── run_backend.py               # Backend startup script
└── README.md                    # This file
```

## Development

### Running Tests

```bash
# Backend tests
cd backend
uv run pytest

# With coverage report
uv run pytest --cov=app --cov-report=html

# Run specific test file
uv run pytest tests/test_agents.py -v
```

### Adding a New Report Section

1. **Define Section ID** in `backend/app/models/enums.py`:
   ```python
   class SectionId(str, Enum):
       NEW_SECTION = "new_section"
   ```

2. **Create Section Config** in `backend/app/models/sections.py`:
   ```python
   SECTION_CONFIGS[SectionId.NEW_SECTION] = SectionConfig(
       section_id=SectionId.NEW_SECTION,
       display_name="New Section",
       description="Description of what this section covers",
   )
   ```

3. **Add Research Prompt** in `backend/app/prompts/research_prompts.py`:
   ```python
   def get_new_section_prompt(company_name: str, is_public: bool) -> str:
       return f"Research prompt for {company_name}..."
   ```

4. **Update Frontend Types** in `frontend/src/types/report.ts`:
   ```typescript
   export type SectionId = 
     | 'executive_summary'
     | 'new_section'  // Add here
     | ...
   ```

5. **Add to Processing Order** in `backend/app/agents/orchestrator.py`:
   ```python
   SECTION_ORDER = [
       SectionId.EXECUTIVE_SUMMARY,
       SectionId.NEW_SECTION,  # Add here
       ...
   ]
   ```

### Customizing Prompts

All prompts are in `backend/app/prompts/`:
- **research_prompts.py**: What data to gather for each section
- **extraction_prompts.py**: How to extract structured data for visualizations
- **writer_prompts.py**: How to format the final content

### Adding Visualizations

1. Create component in `frontend/src/components/visualizations/`
2. Add data structure to `backend/app/models/visualizations.py`
3. Update extraction logic in `backend/app/agents/data_extractor.py`
4. Import and use in `frontend/src/components/report/SectionContent.tsx`

## Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError` or import errors
```bash
# Reinstall dependencies
cd backend
uv sync --all-extras
```

**Problem**: API key errors
```bash
# Verify .env file exists and has correct keys
cat ../.env | grep API_KEY
```

**Problem**: Port 8000 already in use
```bash
# Change port in .env
PORT=8001
# Or kill existing process
lsof -ti:8000 | xargs kill -9
```

### Frontend Issues

**Problem**: Cannot connect to backend
- Verify backend is running on http://localhost:8000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors

**Problem**: Build errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Document Upload Issues

**Problem**: File upload fails
- Check file size (max 20MB)
- Verify file type is supported
- Check backend logs for Gemini API errors

## Performance Optimization

- **Parallel Processing**: Sections are processed sequentially but research iterations run in parallel
- **Caching**: Uploaded documents are cached in Gemini File API for 48 hours
- **Timeouts**: Configurable timeouts prevent hanging on slow sections
- **Retry Logic**: Automatic retries with exponential backoff for API failures

## Security Considerations

- API keys stored in environment variables (never committed)
- CORS configured for specific origins
- File upload validation (type, size)
- Input sanitization for company names
- No persistent storage of sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- **Google Gemini** for advanced AI capabilities
- **Tavily** for intelligent web search
- **LangChain** for agent orchestration
- **FastAPI** for high-performance backend
- **Next.js** for modern frontend framework
- **Recharts** for beautiful visualizations

## Support

For issues, questions, or contributions, please open an issue on GitHub.
