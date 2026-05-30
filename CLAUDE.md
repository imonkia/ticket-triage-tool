# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (`/client`)
```bash
npm run dev      # start Vite dev server (port 5173, proxies /triage → localhost:5000)
npm run build    # tsc + vite build → dist/
npm run preview  # preview production build locally
```

### Backend (`/server`)
```bash
python app.py                   # Flask dev server on port 5000 (debug mode)
gunicorn app:app                # production server
pip install -r requirements.txt # install dependencies
```

## Architecture

```
ticket-triage-tool/
├── client/   React/TypeScript/Vite frontend
└── server/   Flask/Python backend
```

### Data flow

1. User clicks record → `useDeepgram` hook opens a WebSocket to Deepgram's live transcription API directly from the browser using `VITE_DEEPGRAM_API_KEY`.
2. `MediaRecorder` streams microphone audio as 250ms chunks into the WebSocket connection.
3. Deepgram emits `Transcript` events; interim results update `interimTextRef`, final results accumulate in `finalTextRef`. Both are merged into the `transcript` state shown live.
4. On stop, `stopRecording()` returns the final transcript synchronously (from refs, not stale state) and `App.tsx` POSTs it to `/triage`.
5. Flask receives the transcript, sends it to Claude via the Anthropic SDK, and parses the response as `{ category, severity, suggested_response }` JSON.
6. Frontend renders the triage result in `TriageResult`.

### Key design decisions

- **Transcript returned from `stopRecording()`** — React state is async; returning the accumulated value from refs ensures the POST always has the full transcript even if the final Deepgram event arrives just before stop.
- **`VITE_API_URL` env var** — In dev, Vite proxies `/triage` to Flask. In production, set `VITE_API_URL` to the Railway backend URL so requests go to the correct origin.
- **CORS** — Flask uses `flask-cors` with `ALLOWED_ORIGINS` env var (defaults to `*`). Set it to the Vercel frontend URL in production.

### Frontend structure

- `src/hooks/useDeepgram.ts` — all Deepgram SDK and MediaRecorder logic; exposes `{ isRecording, transcript, startRecording, stopRecording, resetTranscript }`
- `src/App.tsx` — state orchestration: handles recording lifecycle, POST to `/triage`, error states
- `src/components/` — `RecordButton`, `TranscriptDisplay`, `TriageResult` (presentational)

### Backend structure

- `server/app.py` — single Flask app with a `GET /` health check and `POST /triage` endpoint
- The Claude prompt in `TRIAGE_PROMPT` instructs the model to return raw JSON only; the response handler strips accidental markdown fences before `json.loads()`
