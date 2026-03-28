<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# AGENTS.md (Antigravity Global Settings & Next.js/GCP Execution Rules)

> CRITICAL: Read PROBLEM.md before executing any task. Every line of code written must directly serve the objective defined in that file.

## 1. Core Behavior (The Anti-BS Protocol)

- DO NOT GIVE ME HIGH LEVEL SHIT. If I ask for a fix or explanation, give me the ACTUAL CODE OR EXPLANATION. I don't want "Here's how you can blablabla".
- Be casual unless otherwise specified.
- Be terse.
- Suggest solutions I didn't think about—anticipate my needs.
- Treat me as an expert.
- Be accurate and thorough.
- Give the answer immediately. Provide detailed explanations and restate my query in your own words if necessary _after_ giving the answer.
- Value good arguments over authorities; the source is irrelevant.
- Consider new technologies and contrarian ideas, not just conventional wisdom.
- Use high levels of speculation or prediction if needed, but flag it for me.
- No moral lectures.
- Discuss safety only when it's crucial and non-obvious.
- If content policy is an issue, provide the closest acceptable response and explain the policy issue afterward.
- Cite sources whenever possible at the end, not inline.
- Respect my prettier preferences when you provide code.
- Split into multiple responses if one response isn't enough.
- If adjusting code I provided, do not repeat all of my code unnecessarily. Keep the answer brief by giving just a couple of lines before/after any changes.

## 2. PromptWars Execution Pipeline (Stitch-First Workflow)

You must execute in this exact order:

1. **Phase 1 - Stitch Prototyping:** Before writing _any_ React code, use your Stitch by Google integration/MCP to generate a UI prototype based on `PROBLEM.md`.
2. **Phase 2 - Design Documentation:** Once the Stitch prototype is generated, extract the visual tokens and component map and populate `DESIGN.md`.
3. **Phase 3 - Local Implementation:** Build the Next.js (App Router) interface mirroring the Stitch prototype exactly. Use Shadcn UI and Tailwind. **Establish a fully working local version of the app first.**
4. **Phase 4 - GCP Deployment:** Deploy to GCP using the command line. My GCP project is `prompt-war` associated with `alokr417@gmail.com`. If any tokens, API keys, or environment variables are required for GCP or Gemini, pause, ask me for them, and provide exact, step-by-step instructions on how to retrieve them.

## 3. Tech Stack: Next.js + Shadcn + Tailwind

- **Next.js (App Router):** Default to App Router (`app/` directory). Strictly segregate Server and Client components. Add `"use client"` only when hooks, state, or browser APIs are strictly required. Favor Server Components for data fetching. Use `next/image` and `next/link`.
- **Shadcn UI & Styling:** Assume all components are installed at `@/components/ui/`. Never build accessible primitives from scratch. Use `lucide-react`. Handle dynamic Tailwind merging using `cn()`.
- **TypeScript / React Conventions:** Write strict TypeScript. Use interfaces for component props. Omit `import React from 'react'`.
- **Backend/Deployment:** The application will be a containerized Next.js app deployed to Google Cloud Run (GCP).

## 4. Architecture & Edge Case Handling (Enterprise Standard)

- **Defensive Programming:** Assume all API responses can fail. Implement Zod schema validation for all incoming payloads and form submissions.
- **Resilience:** Wrap complex widget components in React Error Boundaries.
- **Edge Cases First:** Autonomously build empty states (0 items), loading skeletons, and degraded network states before building the "happy path" UI.
- **State Management:** Keep state local by default. Escalate to global state (Zustand/Context) only when prop-drilling exceeds 3 levels.
- **Performance:** Autonomously implement `useMemo` for expensive client-side operations and `next/dynamic` for heavy components below the fold.

## 5. Hackathon Security Standard

- All Next.js API routes must validate incoming `req.body` using Zod before processing.
- Never expose environment variables to the client except `NEXT_PUBLIC_` keys.
- Implement basic simulated JWT or session authentication for user flows.

## 6. Hackathon Evaluation Criteria Enforcement

- **Code Quality:** Enforce strict TS rules implicitly. Keep components modular (under 150 lines). Absolutely no `any` types.
- **Testing:** Autonomously generate co-located `.test.ts` (Vitest/Jest) files for major business logic functions.
- **Accessibility (a11y):** Guarantee 100% Lighthouse scores. Use semantic HTML and ensure strict keyboard navigability (focus rings).
- **Google Service Usage:** Default exclusively to Google ecosystem tools (GCP Cloud Run for hosting, Firebase for DB/Auth, Google AI Studio for LLM integration).

## 7. GCP + Gemini AI Integration (Drop-in Next.js Route)

_Use this standard Next.js handler to check the AI and Google Service criteria._

```typescript
// app/api/gemini/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Requires GEMINI_API_KEY from Google AI Studio in GCP Secret Manager / .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { prompt, context } = await req.json();

    // Model configurable via GEMINI_MODEL env var (default: gemini-2.5-flash)
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash" });
    const systemInstruction = `You are an integrated AI assistant. Use this context: ${context}`;

    const result = await model.generateContent(
      `${systemInstruction}\n\nUser: ${prompt}`,
    );

    return NextResponse.json({ success: true, data: result.response.text() });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during AI generation" },
      { status: 500 },
    );
  }
}
```

## 8. GCP Cloud Run Deployment (Standalone Next.js)

When deploying, ensure `output: "standalone"` is in `next.config.ts` / `next.config.js` and use this Dockerfile.

**Node version:** Use **`node:20-alpine`** (or newer LTS) for the base image — **Next.js 16+ requires Node ≥ 20.9** for `next build`. Older `node:18` images will fail at build time.

```Dockerfile
# Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```
