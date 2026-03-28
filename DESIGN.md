# DESIGN.md

## Color Tokens
- **Background**: Dark Theme surface defaults (`bg-zinc-950` / `bg-black`)
- **Primary / Accents**: Tactical Red (`text-red-500`, `bg-red-600`) for high-severity items, warning colors (`yellow-500`, `amber-500`) for urgent, and success colors (`green-500`) for stable states.
- **Surface**: Elevated dark panels (`bg-zinc-900`) with subtle gray borders (`border-zinc-800`).

## Typography Scale
- **Font Family**: Space Grotesk (Primary / `--font-heading`), Inter (Secondary/Body / `--font-sans`).
- **Headings**: High-contrast, tight tracking (`tracking-tight`, `font-bold`). CSS custom property `font-heading` maps to Space Grotesk via `--font-space-grotesk`.
- **Body**: Relaxed leading (`leading-relaxed`), typically `text-zinc-300`.
- **Labels**: Small and muted (`text-xs text-zinc-500 uppercase tracking-wider`).

## Component Map
- **AppShell**: Responsive sidebar (horizontal scroll on mobile, fixed sidebar on desktop), and a main content area.
- **ContextAssistantStrip**: Client-only panel that updates when the operating domain changes; surfaces **focus**, **reasoning**, and **expected structured outputs** for the smart assistant (ties UI to `lib/scenario-context.ts`).
- **ScenarioSidebar**: Navigation links for all 5 domains:
    - `/` — E-Medical Triage (`medical`)
    - `/` — Disaster Coordination (`disaster`)
    - `/` — Infra Management (`infrastructure`)
    - `/` — Bio / Epidemiology (`epidemiology`)
    - `/` — Traffic Rerouting (`traffic`)
- **InputPanel**: 
    - File Dropzone (drag & drop, keyboard-accessible with `role="button"`, `tabIndex`, `onKeyDown`).
    - Voice Recorder (microphone button with pulsing animation, `aria-label` for screen readers).
    - Text Paste (wide textarea with `<label htmlFor>` binding).
- **PipelineVisualizer**: Horizontal/Vertical stepper showing `Ingest → Parse → Structure → Verify → Act`. Active states lit up. Wrapped in `aria-live="polite"` for screen reader announcements.
- **OutputCard**: Structured data display featuring `SeverityBadge`, `ConfidenceScore` (progress bar with `aria-label`), and a primary `DispatchButton` with inline success feedback (no alert popups).
- **EmptyState**: Shown when pipeline is idle and no output exists. Subtle prompt to guide user.
- **ErrorBoundary**: Wraps `InputPanel`, `PipelineVisualizer`, `OutputCard` individually. Catches runtime errors and shows retry UI.

## Next.js App Router Error Pages
- **`error.tsx`**: Route-level error boundary with styled recovery UI and "Try Again" button.
- **`global-error.tsx`**: Root-level catch-all with its own `<html>` and `<body>` tags.
- **`not-found.tsx`**: Custom 404 page with IntentBridge branding.
- **`loading.tsx`**: Loading skeleton matching the dashboard layout.

## Interaction States
- **Hover**: Subtle background lightness shift (e.g., `hover:bg-zinc-800`).
- **Active / Disabled**: Reduced opacity for disabled items (`opacity-50`), loaders in primary action buttons.
- **Focus Rings**: Universal application of `focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2`.

## Accessibility (a11y)
- Real-time `aria-live` announcements for pipeline state changes.
- `role="alert"` on error messages for immediate screen reader notification.
- `role="button"` + keyboard handlers on non-semantic interactive elements (file dropzone).
- `aria-label` on icon-only buttons (mic, dispatch, dismiss).
- Focus lock within open modals/drawers.
- WCAG AA contrast compliance across text and backgrounds.

## Security Architecture
- All API requests validated with Zod schemas before processing.
- MIME type allowlist enforcement (images, audio, PDF only).
- Payload size limit (10MB per field).
- Sliding-window rate limiter (10 req/min per IP).
- Security headers via Next.js middleware (CSP, X-Frame-Options, etc.).
- Error sanitization prevents API key/path leakage.
