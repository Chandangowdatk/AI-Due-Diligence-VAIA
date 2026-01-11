# Due Diligence Platform - Frontend

Next.js 14 frontend for the AI-powered due diligence platform.

## Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)

## Features

- Real-time research progress tracking (polling every 3 seconds)
- 10 report sections with interactive visualizations
- PDF and JSON export
- Responsive design with Tailwind CSS
- Recharts for data visualizations

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home/search page
│   └── report/[id]/       # Report viewer
├── components/
│   ├── ui/                # Reusable UI components
│   ├── search/            # Search components
│   ├── report/            # Report viewer components
│   └── visualizations/    # Recharts components
├── hooks/                 # React hooks
├── lib/                   # Utilities and API client
├── styles/                # Global CSS
└── types/                 # TypeScript types
```
