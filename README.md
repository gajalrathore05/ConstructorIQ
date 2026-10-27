# ConstructIQ — AI Construction Intelligence

> **Intelligent Decisions. Safer Construction.**

A full-stack AI-powered construction intelligence platform built with React + FastAPI.

---

## Features

| Module | Description |
|--------|-------------|
| 🤖 AI Assistant | Multimodal chat — text + image questions about construction |
| 🛡️ Site Safety | AI image analysis for construction site safety hazards |
| 🔍 Crack Analysis | Structural crack photograph analysis with engineering context |
| 🏘️ Real Estate Valuation | Preliminary property value estimation |
| 📋 Project Planning | Full project & task CRUD with progress tracking |
| 🌦️ Weather Advisory | Live weather with construction-specific advisories |
| 📊 Dashboard | Project KPIs, budget charts, analysis history |
| 📄 Reports | PDF report generation and analysis history |

---

## Quick Start

### Prerequisites
- Python 3.10+ 
- Node.js 18+
- (Optional) Gemini or OpenAI API key for live AI

---

### Backend Setup (Windows PowerShell)

```powershell
cd "d:\Multimodal Construction Intelligence Platform\backend"

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Configure environment
Copy-Item .env.example .env
# Edit .env — add your GEMINI_API_KEY or OPENAI_API_KEY

# Start the server
uvicorn app.main:app --reload --port 8000
```

API docs available at: **http://localhost:8000/api/docs**

---

### Frontend Setup (Windows PowerShell)

```powershell
cd "d:\Multimodal Construction Intelligence Platform\frontend"

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

App available at: **http://localhost:5173**

---

### On macOS / Linux

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# edit .env
uvicorn app.main:app --reload --port 8000

# In another terminal
cd frontend
npm install
npm run dev
```

---

## AI Provider Setup

### Option A — Google Gemini (Recommended, free tier available)
1. Get a key at https://aistudio.google.com
2. In `backend/.env`: `GEMINI_API_KEY=your_key_here`
3. `AI_PROVIDER=gemini` (default)

### Option B — OpenAI
1. Get a key at https://platform.openai.com
2. In `backend/.env`: `OPENAI_API_KEY=your_key_here`, `AI_PROVIDER=openai`

Without a key, the platform runs in **Demo Mode** — all features work but AI responses are clearly labelled placeholders.

---

## Weather Setup

1. Free key at https://openweathermap.org/api
2. In `backend/.env`: `WEATHER_API_KEY=your_key_here`

---

## Running Tests

```powershell
cd "d:\Multimodal Construction Intelligence Platform\backend"
.\venv\Scripts\Activate.ps1
python -m pytest tests/test_api.py -v
```

---

## Project Structure

```
Multimodal Construction Intelligence Platform/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── core/                # Config & logging
│   │   ├── api/routes/          # All API route handlers
│   │   ├── models/              # SQLAlchemy database models
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── services/            # AI, safety, crack, valuation, weather
│   │   └── db/                  # Database init & session
│   ├── uploads/                 # Uploaded files (gitignored)
│   ├── tests/                   # pytest test suite
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/               # Dashboard, AIAssistant, SiteSafety, etc.
    │   ├── components/          # Reusable UI components
    │   ├── layouts/             # AppLayout (sidebar + topnav)
    │   ├── services/            # Axios API client
    │   └── hooks/               # React hooks
    ├── package.json
    └── vite.config.js
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check + AI/weather status |
| GET | `/api/v1/dashboard` | Dashboard stats & recent data |
| GET/POST | `/api/v1/projects/` | List / create projects |
| GET/PUT/DELETE | `/api/v1/projects/{id}` | Get / update / delete project |
| GET/POST | `/api/v1/projects/{id}/tasks` | List / create tasks |
| PUT/DELETE | `/api/v1/tasks/{id}` | Update / delete task |
| POST | `/api/v1/ai/chat` | AI chat (multipart, supports image) |
| GET | `/api/v1/ai/conversations` | List conversations |
| POST | `/api/v1/safety/analyze` | Site safety image analysis |
| POST | `/api/v1/cracks/analyze` | Crack photo analysis |
| POST | `/api/v1/valuation/estimate` | Property valuation estimate |
| POST | `/api/v1/planning/generate` | AI project plan generation |
| GET | `/api/v1/weather` | Weather by location |
| GET | `/api/v1/analyses` | Analysis history |
| GET | `/api/v1/analyses/{id}/report` | Download PDF report |
| GET/POST | `/api/v1/diary` | Site diary entries |

Full interactive docs: **http://localhost:8000/api/docs**

---

## Known Limitations

- **AI analysis** requires a Gemini or OpenAI API key. Without one, demo placeholders are shown with a clear label.
- **Crack width** is never estimated from photos — no calibrated reference exists in uploaded images.
- **Valuation** produces preliminary illustrative estimates only — not certified appraisals.
- **Safety findings** are preliminary AI observations requiring verification by a qualified safety professional.
- **Weather** requires an OpenWeatherMap API key for live data.
- SQLite is used for local development. For production, set `DATABASE_URL` to a PostgreSQL connection string.
- Uploaded files are stored locally in `backend/uploads/`. Configure cloud storage for production.

---

## Security Notes

- API keys are stored in `.env` only — never in browser code or the database.
- File uploads are validated for type (JPEG/PNG/WebP) and size (20MB max).
- CORS is restricted to `ALLOWED_ORIGINS` in `.env`.
- `.env` is gitignored.
