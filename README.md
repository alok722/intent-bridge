# IntentBridge

> Gemini-powered universal bridge between human intent and complex emergency response systems.

IntentBridge accepts **any unstructured, messy, real-world input** — free-text notes, photographs, voice recordings, scanned documents — and instantly converts them into **structured, validated, actionable intelligence** for emergency responders and decision-makers.

---

## Selected Vertical

**Emergency Services & Public Safety**

The application targets five critical domains where unstructured data must be converted into immediate, life-impacting decisions:

| Domain | Input Example | Output |
|--------|--------------|--------|
| **E-Medical Triage** | Blurry photo + garbled voice note from paramedic | Structured triage card, ICD-10 codes, nearest trauma center |
| **Disaster Coordination** | Live weather feed + sensor data JSON | Flood/disaster alert with evacuation routes and resource dispatch |
| **Infrastructure Management** | Citizen photo of damaged bridge | Damage classification, severity score, municipal work-order |
| **Bio / Epidemiology** | Free-text news article about disease outbreak | WHO-format epidemiology report + public advisory draft |
| **Traffic Rerouting** | Chaotic incident report | Structured diversion plan with detour instructions |

---

## Approach & Underlying Logic

### Why Gemini?

Real-world emergency data is inherently multi-modal and messy. Google's Gemini model is uniquely suited because it natively processes text, images, and audio in a single inference call — no separate OCR, speech-to-text, or vision pipelines required.

### Architecture

```
User Input (text / image / voice)
        │
        ▼
┌─────────────────┐
│  Next.js Client  │  Multi-modal ingestion (InputPanel)
│  (React 19)      │  Zustand state management
└────────┬────────┘
         │ POST /api/gemini (JSON)
         ▼
┌─────────────────┐
│  API Route       │  Zod validation ─► MIME allowlist ─► size guard
│  (Server)        │  Rate limiting (sliding window)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Google Gemini   │  Scenario-specific system prompt
│  (Cloud AI)      │  Model fallback chain (primary → backup)
└────────┬────────┘
         │ JSON response
         ▼
┌─────────────────┐
│  API Route       │  JSON extraction (markdown fence handling)
│  (Server)        │  Zod schema validation per scenario
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Client UI       │  5-stage pipeline visualization
│                  │  Structured output card with severity/confidence
│                  │  Dispatch action
└─────────────────┘
```

### 5-Stage Processing Pipeline

The UI visualizes the inference pipeline in real-time:

1. **Ingest** — Raw input captured and encoded
2. **Parse** — Sent to Gemini with scenario-specific system prompt
3. **Structure** — Model output parsed into structured JSON
4. **Verify** — Response validated against Zod schema
5. **Act** — Structured intelligence displayed with dispatch capability

---

## How the Solution Works

1. User selects an operating domain (medical, disaster, infrastructure, epidemiology, traffic) via the sidebar.
2. User provides input through one or more modalities: free-text, file upload (drag-and-drop), or voice recording.
3. On submission, the client sends the data to `/api/gemini` as JSON with base64-encoded media.
4. The server validates the payload (Zod schema, MIME type allowlist, 10MB size limit, rate limiting).
5. The server sends the input to Google Gemini with a domain-specific system prompt that instructs JSON-only output.
6. If the primary model fails (429/404), the server retries with a fallback model.
7. The server extracts JSON from the response (handling markdown fences), optionally validates against the scenario's response schema, and returns structured data.
8. The client renders the output with severity badges, confidence scores, and actionable dispatch commands.

---

## Assumptions

- **Gemini API Key:** A valid `GEMINI_API_KEY` from Google AI Studio is required. The key is stored server-side only (never exposed to the client).
- **Model Availability:** The configured model (default: `gemini-2.5-flash`) is available via the Generative AI SDK. A fallback model is attempted on quota/availability errors.
- **Browser Support:** Voice recording requires `MediaRecorder` API support (Chrome, Firefox, Edge). File upload works on all modern browsers.
- **Network:** The client requires connectivity to the Next.js server; the server requires connectivity to `generativelanguage.googleapis.com`.
- **Input Quality:** Gemini's output quality depends on input quality. Blurry images or garbled audio may produce lower confidence scores.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router) | Server/client rendering, API routes |
| UI Library | React 19 | Component rendering |
| Language | TypeScript 5 (strict) | Type safety |
| Styling | Tailwind CSS 4 + Shadcn UI | Design system, accessible primitives |
| State | Zustand 5 | Client-side state management |
| Validation | Zod 4 | Request/response schema validation |
| AI | Google Gemini (via @google/generative-ai) | Multi-modal inference |
| Icons | Lucide React | UI iconography |
| Deployment | Docker + GCP Cloud Run | Containerized production hosting |

---

## Google Services Integration

- **Google Gemini API:** Core AI engine for multi-modal inference. Accepts text + images + audio in a single call. Model configurable via `GEMINI_MODEL` environment variable.
- **GCP Cloud Run:** Production deployment target. Dockerfile uses multi-stage build with `node:20-alpine` and Next.js standalone output.
- **Google Fonts:** Space Grotesk (headings) and Inter (body) loaded via `next/font/google` for zero layout shift.

---

## Setup

```bash
# 1. Clone and install
git clone <repo-url> && cd prompt-war
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local and add your Gemini API key:
# GEMINI_API_KEY=your_key_from_ai_studio
# GEMINI_MODEL=gemini-2.5-flash  (optional, this is the default)

# 3. Run development server
npm run dev
# Open http://localhost:3000
```

---

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npx vitest --watch
```

Tests cover:
- Zod schema validation (all 5 request/response schemas)
- Scenario prompt generation and fallback behavior
- Utility functions (`cn`, `toBase64`)
- Zustand store state transitions and async flows
- API route validation, security guards, and error handling

---

## Deployment

### Docker (Local)

```bash
docker build -t intent-bridge .
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key intent-bridge
```

### GCP Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/prompt-war/intent-bridge

# Deploy
gcloud run deploy intent-bridge \
  --image gcr.io/prompt-war/intent-bridge \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key,GEMINI_MODEL=gemini-2.5-flash
```

Cloud Run sets `PORT` at runtime (commonly `8080`); the Next.js standalone `server.js` listens on `process.env.PORT`, so the revision container port should match (defaults are usually correct). Prefer Secret Manager (`--set-secrets`) for `GEMINI_API_KEY` in real deployments instead of plain env vars.

> JLL policy requires InfoSec approval before deploying to external infrastructure. For prototyping, use localhost.

---

## Security

- **Input Validation:** All API requests validated with Zod schemas before processing.
- **MIME Type Allowlist:** Only JPEG, PNG, WebP, GIF, PDF, WebM, MP4, OGG, MPEG accepted.
- **Payload Size Limit:** Base64 payloads capped at 10MB per field.
- **Rate Limiting:** Sliding window rate limiter (10 requests/minute per IP).
- **Security Headers:** CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy via middleware.
- **Error Sanitization:** API key values and internal paths are never leaked in error responses.
- **Environment Isolation:** `GEMINI_API_KEY` is server-only; never exposed via `NEXT_PUBLIC_` prefix.

---

## Accessibility

- **Keyboard Navigation:** All interactive elements (dropzone, mic button, sidebar, dispatch) are keyboard-accessible with visible focus rings.
- **Screen Reader Support:** `aria-live` regions announce pipeline stage changes; `role="alert"` on error messages; `aria-label` on icon-only buttons.
- **Semantic HTML:** Proper heading hierarchy, landmark elements, labeled form controls.
- **WCAG AA:** Dark theme designed for contrast compliance; focus-visible indicators throughout.
