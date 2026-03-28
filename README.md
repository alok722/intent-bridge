# IntentBridge

> Gemini-powered universal bridge between human intent and complex emergency response systems.

IntentBridge accepts **any unstructured, messy, real-world input** — free-text notes, photographs, voice recordings, scanned documents — and instantly converts them into **structured, validated, actionable intelligence** for emergency responders and decision-makers.

### Submission bundle (under 1 MB)

Evaluators usually measure the **uploaded archive**, not a full clone that includes `node_modules` or `.next` (those are often **hundreds of MB**). Submit **source only**:

```bash
npm run pack:submit
```

This creates `intent-bridge-submit.zip` (typically **~150–200 KB** compressed), excluding dependencies, build output, git metadata, and local secrets. The script fails if the zip reaches **≥ 1 MB**.

`npm install && npm run build` restores a runnable app from that bundle.

### How this solution maps to core criteria

| Criterion | How IntentBridge demonstrates it |
|-----------|-----------------------------------|
| **Smart, dynamic assistant** | Operating-domain switcher drives **different system prompts and JSON schemas** per scenario; the dashboard **Context strip** updates live to explain focus, reasoning, and expected outputs. Inference uses **Google Gemini** multi-modally (text, image, audio). |
| **Logical decisions from user context** | **Scenario-aware** `getSystemPrompt(scenario)` + `getScenarioAssistantContext(domain)` route behavior (triage vs traffic vs epidemiology); server validates requests with **Zod** and applies **rate/size/MIME** policy before calling the model. |
| **Effective use of Google Services** | **Gemini API** (`@google/generative-ai`) for generation; **Next.js** deployment path documented for **Cloud Run**; **Google Fonts** (Space Grotesk, Inter) via `next/font/google`. |
| **Practical, real-world usability** | **Multi-modal intake** (paste, file, voice), **5-step pipeline** feedback, **empty/error states**, keyboard-accessible dropzone, **WCAG-oriented** labels and `aria-live` regions, **Dockerfile** for production-shaped delivery. |
| **Clean, maintainable code** | **Strict TypeScript**, modular components, shared **Zustand** store, **co-located Vitest tests**, centralized **schemas** and **lib/** helpers, **ESLint** clean, **multi-stage Docker** build. |

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

#### Production: `GEMINI_API_KEY` in Secret Manager

For production, avoid plaintext keys in deploy commands or long‑lived CI secrets. Store the key in [Secret Manager](https://cloud.google.com/secret-manager) and mount it into Cloud Run as an environment variable (no app code changes — the API route still reads `process.env.GEMINI_API_KEY`).

1. **Create the secret** (once per project):

   ```bash
   export PROJECT_ID=sanguine-tome-491605-m7
   printf '%s' "YOUR_AI_STUDIO_KEY" | gcloud secrets create gemini-api-key \
     --data-file=- --project="$PROJECT_ID"
   ```

2. **Allow the Cloud Run service account to read it** (use the runtime SA shown in Cloud Run → service details, or the default compute SA if you use that):

   ```bash
   gcloud secrets add-iam-policy-binding gemini-api-key \
     --project="$PROJECT_ID" \
     --member="serviceAccount:YOUR_RUN_SA@${PROJECT_ID}.iam.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

3. **Deploy with [`--set-secrets`](https://cloud.google.com/sdk/gcloud/reference/run/deploy#--set-secrets)** (maps secret → env var name):

   ```bash
   gcloud run deploy intent-bridge \
     --image "$IMAGE" \
     --project "$PROJECT_ID" \
     --region "$REGION" \
     --platform managed \
     --allow-unauthenticated \
     --set-secrets="GEMINI_API_KEY=gemini-api-key:latest" \
     --set-env-vars="GEMINI_MODEL=gemini-2.5-flash"
   ```

**GitHub Actions:** Grant the deploy service account `roles/secretmanager.secretAccessor` on `gemini-api-key`. The workflow supports Secret Manager via repository variables (see below); you can remove the `GEMINI_API_KEY` repository **secret** once the deploy uses `--set-secrets` only.

#### Firestore inference audit (Google Services)

Optional **Firebase Admin + Firestore** writes one document per `/api/gemini` call to collection **`intent_bridge_audit`**. Payloads include **scenario, input modalities (text/file/audio flags), latency, HTTP status, resolved model, error category** — **not** raw user text or base64.

1. Firebase Console → attach the same GCP project → create a **Firestore** database (Native).
2. Grant the **Cloud Run service account** used at runtime `roles/datastore.user` (or equivalent Firestore access).
3. Set **`ENABLE_FIRESTORE_LOG=true`** and **`FIREBASE_PROJECT_ID=<project_id>`** on the service (see `.env.example`). On Cloud Run, Application Default Credentials are used automatically.

### Continuous deployment (GitHub Actions)

On every **push to `main`**, [`.github/workflows/deploy-cloud-run.yml`](.github/workflows/deploy-cloud-run.yml) builds the `Dockerfile`, pushes to **`us-central1-docker.pkg.dev/sanguine-tome-491605-m7/intent-bridge/intent-bridge`**, and deploys the Cloud Run service **`intent-bridge`**.

**One-time GCP + GitHub setup (Workload Identity Federation — no JSON key in GitHub):**

1. Install `gcloud` and log in as `alokr417@gmail.com`.
2. From the repo root:

   ```bash
   export GITHUB_REPO="alok722/intent-bridge"
   bash scripts/setup-gcp-github-wif.sh
   ```

   Use the exact `owner/repo` from the GitHub URL (lowercase). If the OIDC provider already existed with the wrong repo, re-run the script — it **updates** `attribute-condition` on the existing provider.

3. In GitHub: **Settings → Secrets and variables → Actions → New repository secret**, add:
   - `GCP_WORKLOAD_IDENTITY_PROVIDER` — value printed by the script (`projects/…/locations/global/workloadIdentityPools/…/providers/…`)
   - `GCP_SERVICE_ACCOUNT` — deploy service account email printed by the script
4. Optional: **`GEMINI_API_KEY`** repository **secret** so deploy passes a key via `--set-env-vars` (demos / quick setup). For production, prefer Secret Manager (next bullet).
5. Optional: repository **Variables** (not secrets):
   - **`USE_GCP_SECRET_MANAGER`** = `true` — deploy uses `--set-secrets GEMINI_API_KEY=<GCP_GEMINI_SECRET_NAME>:latest` (create that secret in GCP; deploy SA needs `secretmanager.secretAccessor`).
   - **`GCP_GEMINI_SECRET_NAME`** — Secret Manager secret id (default in workflow: `gemini-api-key`).
   - **`ENABLE_FIRESTORE_LOG`** = `true` — adds `ENABLE_FIRESTORE_LOG=true` and `FIREBASE_PROJECT_ID` to the Cloud Run service (requires Firestore setup above).

**Troubleshooting: `unauthorized_client` / “rejected by the attribute condition”**

The GitHub OIDC token’s `repository` claim must match the Workload Identity provider’s CEL condition (usually `assertion.repository == 'alok722/intent-bridge'`). Fix by updating the provider (adjust pool/provider IDs if yours differ):

```bash
export PROJECT_ID=sanguine-tome-491605-m7
export GITHUB_REPO="alok722/intent-bridge"   # lowercase owner/repo
gcloud iam workload-identity-pools providers update-oidc github-oidc \
  --project="$PROJECT_ID" \
  --location=global \
  --workload-identity-pool=github \
  --attribute-condition="assertion.repository == '${GITHUB_REPO}'"
```

If impersonation still fails afterward, ensure the deploy service account has **`roles/iam.workloadIdentityUser`** for principalSet `…/attribute.repository/${GITHUB_REPO}` — re-run `scripts/setup-gcp-github-wif.sh` with the same `GITHUB_REPO`, or fix bindings in **IAM → Service accounts → your deploy SA → Permissions**.

To use another GCP project, edit `GCP_PROJECT_ID` / `GCP_REGION` in the workflow file (or fork the pattern into repository variables).

Cloud Run sets `PORT` at runtime; the Next.js standalone server reads `process.env.PORT`. Prefer Secret Manager for `GEMINI_API_KEY` in production instead of plain env vars.

> JLL policy requires InfoSec approval before deploying to external infrastructure. For prototyping, use localhost.

---

## Security

- **Google Cloud:** Gemini (Generative Language API), optional **Secret Manager** for keys, optional **Firestore** audit metadata, **Cloud Run** hosting.
- **Input Validation:** All API requests validated with Zod schemas before processing.
- **MIME Type Allowlist:** Only JPEG, PNG, WebP, GIF, PDF, WebM, MP4, OGG, MPEG accepted.
- **Payload Size Limit:** Base64 payloads capped at 10MB per field.
- **Rate Limiting:** Sliding window rate limiter (10 requests/minute per IP).
- **Security Headers:** CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy via middleware.
- **Error Sanitization:** API key values and internal paths are never leaked in error responses.
- **Environment Isolation:** `GEMINI_API_KEY` is server-only; never exposed via `NEXT_PUBLIC_` prefix.

---

## Accessibility

- **Keyboard Navigation:** File intake uses a native `<button type="button">` for activate-to-browse; mic, sidebar, and dispatch controls are keyboard-operable with visible focus rings.
- **Screen Reader Support:** `aria-live` regions announce pipeline stage changes; `role="alert"` on error messages; descriptive `aria-label` on the file picker control and icon-only buttons.
- **Semantic HTML:** Proper heading hierarchy, landmark elements, labeled form controls.
- **WCAG AA:** Palette tuned for contrast; focus-visible indicators throughout.
