# IntentBridge 🌉

> Gemini-powered universal bridge between human intent and complex emergency response systems.

**Project created for [PromptWars Bengaluru](https://vision.hack2skill.com/event/promptwarsbengaluru).** 🏆

IntentBridge accepts **any unstructured, messy, real-world input** — free-text notes, photographs, voice recordings, scanned documents — and instantly converts them into **structured, validated, actionable intelligence** for emergency responders and decision-makers. 🚀

### 📦 Submission bundle (under 1 MB)

Evaluators usually measure the **uploaded archive**, not a full clone that includes `node_modules` or `.next` (those are often **hundreds of MB**). Submit **source only**:

```bash
npm run pack:submit
```

This creates `intent-bridge-submit.zip` (typically **~150–200 KB** compressed), excluding dependencies, build output, git metadata, and local secrets. The script fails if the zip reaches **≥ 1 MB**.

`npm install && npm run build` restores a runnable app from that bundle.

### 🎯 How this solution maps to core criteria

| Criterion | How IntentBridge demonstrates it |
|-----------|-----------------------------------|
| **Smart, dynamic assistant** | Operating-domain switcher drives **different system prompts and JSON schemas** per scenario; the dashboard **Context strip** updates live to explain focus, reasoning, and expected outputs. Inference uses **Google Gemini** multi-modally (text, image, audio). |
| **Logical decisions from user context** | **Scenario-aware** `getSystemPrompt(scenario)` + `getScenarioAssistantContext(domain)` route behavior (triage vs traffic vs epidemiology); server validates requests with **Zod** and applies **rate/size/MIME** policy before calling the model. |
| **Effective use of Google Services** | **Gemini API** (`@google/generative-ai`) for generation; **Next.js** deployment path documented for **Cloud Run**; **Google Fonts** (Space Grotesk, Inter) via `next/font/google`. |
| **Practical, real-world usability** | **Multi-modal intake** (paste, file, voice), **5-step pipeline** feedback, **empty/error states**, keyboard-accessible dropzone, **WCAG-oriented** labels and `aria-live` regions, **Dockerfile** for production-shaped delivery. |
| **Clean, maintainable code** | **Strict TypeScript**, modular components, shared **Zustand** store, **co-located Vitest tests**, centralized **schemas** and **lib/** helpers, **ESLint** clean, **multi-stage Docker** build. |

---

## 🏗️ Selected Vertical

**Emergency Services & Public Safety** 🛡️

The application targets five critical domains where unstructured data must be converted into immediate, life-impacting decisions:

| Domain | Input Example | Output |
|--------|--------------|--------|
| **E-Medical Triage** 🚑 | Blurry photo + garbled voice note from paramedic | Structured triage card, ICD-10 codes, nearest trauma center |
| **Disaster Coordination** 🌪️ | Live weather feed + sensor data JSON | Flood/disaster alert with evacuation routes and resource dispatch |
| **Infrastructure Management** 🏗️ | Citizen photo of damaged bridge | Damage classification, severity score, municipal work-order |
| **Bio / Epidemiology** 🧪 | Free-text news article about disease outbreak | WHO-format epidemiology report + public advisory draft |
| **Traffic Rerouting** 🚦 | Chaotic incident report | Structured diversion plan with detour instructions |

---

## 🧠 Approach & Underlying Logic

### ✨ Why Gemini?

Real-world emergency data is inherently multi-modal and messy. Google's Gemini model is uniquely suited because it natively processes text, images, and audio in a single inference call — no separate OCR, speech-to-text, or vision pipelines required.

### 🏗️ Architecture

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

### ⚙️ 5-Stage Processing Pipeline

The UI visualizes the inference pipeline in real-time:

1. **Ingest** 📥 — Raw input captured and encoded
2. **Parse** 🔍 — Sent to Gemini with scenario-specific system prompt
3. **Structure** 🧩 — Model output parsed into structured JSON
4. **Verify** ✅ — Response validated against Zod schema
5. **Act** ⚡ — Structured intelligence displayed with dispatch capability

---

## 🛠️ How the Solution Works

1. User selects an operating domain (medical, disaster, infrastructure, epidemiology, traffic) via the sidebar. 🖱️
2. User provides input through one or more modalities: free-text, file upload (drag-and-drop), or voice recording. 🎤
3. On submission, the client sends the data to `/api/gemini` as JSON with base64-encoded media. 📨
4. The server validates the payload (Zod schema, MIME type allowlist, 10MB size limit, rate limiting). 🛡️
5. The server sends the input to Google Gemini with a domain-specific system prompt that instructs JSON-only output. 🤖
6. If the primary model fails (429/404), the server retries with a fallback model. 🔄
7. The server extracts JSON from the response (handling markdown fences), optionally validates against the scenario's response schema, and returns structured data. 📄
8. The client renders the output with severity badges, confidence scores, and actionable dispatch commands. 🚨

---

## 📝 Assumptions

- **Gemini API Key:** A valid `GEMINI_API_KEY` from Google AI Studio is required. The key is stored server-side only (never exposed to the client). 🔑
- **Model Availability:** The configured model (default: `gemini-2.5-flash`) is available via the Generative AI SDK. A fallback model is attempted on quota/availability errors. 🤖
- **Browser Support:** Voice recording requires `MediaRecorder` API support (Chrome, Firefox, Edge). File upload works on all modern browsers. 🌐
- **Network:** The client requires connectivity to the Next.js server; the server requires connectivity to `generativelanguage.googleapis.com`. ☁️
- **Input Quality:** Gemini's output quality depends on input quality. Blurry images or garbled audio may produce lower confidence scores. 📷

---

## 💻 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router) ⚛️ | Server/client rendering, API routes |
| UI Library | React 19 ⚛️ | Component rendering |
| Language | TypeScript 5 (strict) 📘 | Type safety |
| Styling | Tailwind CSS 4 + Shadcn UI 🎨 | Design system, accessible primitives |
| State | Zustand 5 🐻 | Client-side state management |
| Validation | Zod 4 ✅ | Request/response schema validation |
| AI | Google Gemini (via @google/generative-ai) 🤖 | Multi-modal inference |
| Icons | Lucide React ✨ | UI iconography |
| Deployment | Docker + GCP Cloud Run 🐳 | Containerized production hosting |

---

## ☁️ Google Services Integration

- **Google Gemini API:** Core AI engine for multi-modal inference. Accepts text + images + audio in a single call. Model configurable via `GEMINI_MODEL` environment variable. 🤖
- **GCP Cloud Run:** Production deployment target. Dockerfile uses multi-stage build with `node:20-alpine` and Next.js standalone output. 🐳
- **Google Fonts:** Space Grotesk (headings) and Inter (body) loaded via `next/font/google` for zero layout shift. 🔡
- **GA4 Analytics:** Real-time performance and usage tracking. 📊
- **Google Cloud Error Reporting:** Integrated structured logging for production observability. 🚨

---

## 🚀 Setup

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

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npx vitest --watch
```

Tests cover:
- ✅ Zod schema validation (all 5 request/response schemas)
- ✅ Scenario prompt generation and fallback behavior
- ✅ Utility functions (`cn`, `toBase64`)
- ✅ Zustand store state transitions and async flows
- ✅ API route validation, security guards, and error handling

---

## 🚢 Deployment

### 🐳 Docker (Local)

```bash
docker build -t intent-bridge .
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key intent-bridge
```

### ☁️ GCP Cloud Run

Console **project name** *prompt-war* maps to **project ID** `sanguine-tome-491605-m7` (account `alokr417@gmail.com`). Docker images for this app use Artifact Registry **`intent-bridge`** in **`us-central1`**.

Manual deploy (after `gcloud auth login` and `gcloud config set project sanguine-tome-491605-m7`):

```bash
export PROJECT_ID=sanguine-tome-491605-m7
export REGION=us-central1
export IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/intent-bridge/intent-bridge:manual-$(date +%s)"
docker build -t "$IMAGE" . && docker push "$IMAGE"
gcloud run deploy intent-bridge \
  --image "$IMAGE" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key,GEMINI_MODEL=gemini-2.5-flash
```

#### 🔒 Production: `GEMINI_API_KEY` in Secret Manager

For production, avoid plaintext keys in deploy commands or long‑lived CI secrets. Store the key in [Secret Manager](https://cloud.google.com/secret-manager) and mount it into Cloud Run as an environment variable.

1. **Create the secret** (once per project):
   ```bash
   export PROJECT_ID=sanguine-tome-491605-m7
   printf '%s' "YOUR_AI_STUDIO_KEY" | gcloud secrets create gemini-api-key \
     --data-file=- --project="$PROJECT_ID"
   ```

2. **Allow the Cloud Run service account to read it**:
   ```bash
   gcloud secrets add-iam-policy-binding gemini-api-key \
     --project="$PROJECT_ID" \
     --member="serviceAccount:YOUR_RUN_SA@${PROJECT_ID}.iam.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

3. **Deploy with secrets integration**:
   ```bash
   gcloud run deploy intent-bridge \
     --image "$IMAGE" \
     --project "$PROJECT_ID" \
     --set-secrets="GEMINI_API_KEY=gemini-api-key:latest"
   ```

#### 📊 Firestore inference audit (Google Services)

Optional **Firebase Admin + Firestore** writes one document per `/api/gemini` call to collection **`intent_bridge_audit`**.

1. Firebase Console → attach the same GCP project → create a **Firestore** database.
2. Grant the **Cloud Run service account** `roles/datastore.user`.
3. Set **`ENABLE_FIRESTORE_LOG=true`** and **`FIREBASE_PROJECT_ID=<project_id>`**.

#### 🧪 Cloud Translation API (optional)

When **`ENABLE_CLOUD_TRANSLATE=true`**, free-text is translated to **English** before the Gemini call.

1. Enable **Cloud Translation API** on the GCP project.
2. Grant the **Cloud Run runtime** service account **`roles/cloudtranslate.user`**.
3. Set **`ENABLE_CLOUD_TRANSLATE=true`**.

#### 📝 Cloud Logging (structured JSON)

On **Cloud Run**, each inference writes one **JSON** line to stdout with `severity`, `message`, and an `inference` object for deep observability.

---

## 🔐 Security

- 🛡️ **Google Cloud:** Gemini, optional Secret Manager, Firestore audit, Cloud Translation, Cloud Logging.
- 🛡️ **Input Validation:** All API requests validated with Zod schemas.
- 🛡️ **MIME Type Allowlist:** Only JPEG, PNG, WebP, GIF, PDF, WebM, MP4, OGG, MPEG accepted.
- 🛡️ **Rate Limiting:** Sliding window rate limiter (10 requests/minute per IP).
- 🛡️ **Security Headers:** CSP, X-Frame-Options, X-Content-Type-Options via middleware.
- 🛡️ **HSTS:** Forced HTTPS for production environments.

---

## ♿ Accessibility

- ⌨️ **Keyboard Navigation:** Native button intake, sidebar, and dispatch controls with visible focus rings.
- 🗣️ **Screen Reader Support:** `aria-live` regions for pipeline stages, `role="alert"` for errors.
- 🏗️ **Semantic HTML:** Proper heading hierarchy, landmark elements, labeled form controls.
- 🎨 **WCAG AA:** High-contrast palette and focus-visible indicators.

---

> [!NOTE]  
> This project was developed as a rapid response prototype demonstrating the power of the Google Gemini ecosystem for critical public safety applications.
