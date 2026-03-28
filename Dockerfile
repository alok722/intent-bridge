# IntentBridge — Next.js standalone image for GCP Cloud Run (and any Docker host).
# Requires: next.config with output: "standalone"
#
# Cloud Run:
# - Platform sets PORT at runtime (default 8080). Next standalone honors process.env.PORT.
# - Map service "container port" to the port your process listens on, or rely on PORT env.
# - Pass secrets at deploy time: --set-secrets GEMINI_API_KEY=gemini-key:latest
#   Do not bake GEMINI_API_KEY into the image.
#
# Build:  docker build -t intent-bridge .
# Local:  docker run -p 3000:3000 -e GEMINI_API_KEY=... intent-bridge
# GCP:    gcloud run deploy ... --image ... --set-env-vars GEMINI_MODEL=gemini-2.5-flash

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
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Default for local `docker run`; Cloud Run overrides PORT when the service starts.
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
