# DESIGN.md

## Color Tokens
- **Background**: Dark Theme surface defaults (`bg-zinc-950` / `bg-black`)
- **Primary / Accents**: Tactical Red (`text-red-500`, `bg-red-600`) for high-severity items, warning colors (`yellow-500`, `amber-500`) for urgent, and success colors (`green-500`) for stable states.
- **Surface**: Elevated dark panels (`bg-zinc-900`) with subtle gray borders (`border-zinc-800`).

## Typography Scale
- **Font Family**: Space Grotesk (Primary), Inter (Secondary/Body).
- **Headings**: High-contrast, tight tracking (`tracking-tight`, `font-bold`).
- **Body**: Relaxed leading (`leading-relaxed`), typically `text-zinc-300`.
- **Labels**: Small and muted (`text-xs text-zinc-500 uppercase tracking-wider`).

## Component Map
- **AppShell**: Responsive sidebar (Drawer on mobile, fixed sidebar on desktop), and a main content area.
- **ScenarioSidebar**: Navigation links mapping to (`/dashboard/medical`, `/dashboard/disaster`, `/dashboard/infrastructure`).
- **InputPanel**: 
    - File Dropzone (drag & drop interaction).
    - Voice Recorder (microphone button with pulsing animation).
    - Text Paste (wide textarea with character counters).
- **PipelineVisualizer**: Horizontal/Vertical stepper showing `Ingest → Parse → Structure → Verify → Act`. Active states lit up.
- **OutputCard**: Structured data display featuring `SeverityBadge`, `ConfidenceScore` (progress bar), and a primary `DispatchButton`.

## Interaction States
- **Hover**: Subtle background lightness shift (e.g., `hover:bg-zinc-800`).
- **Active / Disabled**: Reduced opacity for disabled items (`opacity-50`), loaders in primary action buttons.
- **Focus Rings**: Universal application of `focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2`.

## Accessibility (a11y)
- Real-time aria-live announcements for pipeline state changes.
- Focus lock within open modals/drawers.
- WCAG AA contrast compliance across text and backgrounds.
