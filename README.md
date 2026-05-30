# Voice Ticket Triage Tool

A full-stack voice support ticket triage tool. Speak a support issue into your microphone; Deepgram transcribes it in real time, then Claude classifies it into a structured triage result.

## Stack

- **Frontend** — React + TypeScript (Vite), `@deepgram/sdk` for browser-side live transcription
- **Backend** — Flask (Python), Anthropic SDK → Claude for triage classification
- **Deploy** — Vercel (frontend) + Railway (backend)

## Local setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- A [Deepgram](https://deepgram.com) API key (free tier works)
- An [Anthropic](https://console.anthropic.com) API key

### Backend

```bash
cd server
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # then fill in ANTHROPIC_API_KEY
python app.py
```

Flask runs on `http://localhost:5000`.

### Frontend

```bash
cd client
npm install
cp .env.example .env             # then fill in VITE_DEEPGRAM_API_KEY
npm run dev
```

Vite runs on `http://localhost:5173` and proxies `/triage` to `localhost:5000`.

## Environment variables

| File | Variable | Description |
|------|----------|-------------|
| `server/.env` | `ANTHROPIC_API_KEY` | Anthropic API key |
| `server/.env` | `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins (defaults to `*`) |
| `client/.env` | `VITE_DEEPGRAM_API_KEY` | Deepgram API key (browser-accessible) |
| `client/.env` | `VITE_API_URL` | Backend base URL for production (leave blank in dev) |

## Deployment

### Backend → Railway

1. Create a new Railway project and connect this repo (or push the `server/` folder).
2. Set `ANTHROPIC_API_KEY` in Railway environment variables.
3. Set `ALLOWED_ORIGINS` to your Vercel frontend URL (e.g. `https://your-app.vercel.app`).
4. Railway detects Python via nixpacks and runs `gunicorn app:app` (from `railway.toml`).
5. Note your Railway service URL (e.g. `https://ticket-triage.railway.app`).

### Frontend → Vercel

1. Import the repo in Vercel; set the **Root Directory** to `client`.
2. Add environment variables:
   - `VITE_DEEPGRAM_API_KEY` — your Deepgram key
   - `VITE_API_URL` — your Railway backend URL (no trailing slash)
3. Vercel uses `vercel.json` to build with `npm run build` and serve from `dist/`.

## API

### `POST /triage`

**Request**
```json
{ "transcript": "I was charged twice for my subscription this month." }
```

**Response**
```json
{
  "category": "billing",
  "severity": "high",
  "suggested_response": "I sincerely apologize for the duplicate charge. I'll escalate this to our billing team immediately and ensure a full refund is processed within 3-5 business days."
}
```

Categories: `billing` · `technical` · `account` · `bug_report` · `feature_request` · `general`  
Severity levels: `low` · `medium` · `high` · `critical`
