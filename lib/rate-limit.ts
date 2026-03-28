/**
 * In-memory sliding-window rate limiter.
 *
 * `WINDOW_MS` — duration of the sliding window in milliseconds.
 * `MAX_REQUESTS` — max allowed requests per IP within the window.
 *
 * Stale entries are lazily pruned on each `isRateLimited` call AND
 * periodically via a background sweep to prevent memory leaks under
 * sustained traffic from many unique IPs.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
/** Run background sweep every 5 minutes. */
const SWEEP_INTERVAL_MS = 5 * 60_000;

const requestLog = new Map<string, number[]>();

/** Periodically prune IPs whose newest timestamp is outside the window. */
let sweepTimer: ReturnType<typeof setInterval> | null = null;

function ensureSweepTimer(): void {
  if (sweepTimer !== null) return;
  sweepTimer = setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of requestLog) {
      const latest = timestamps[timestamps.length - 1] ?? 0;
      if (now - latest >= WINDOW_MS) {
        requestLog.delete(ip);
      }
    }
  }, SWEEP_INTERVAL_MS);
  // Allow Node to exit even if the timer is still pending.
  if (typeof sweepTimer === "object" && "unref" in sweepTimer) {
    sweepTimer.unref();
  }
}

/** Clears sliding-window state (e.g. between Vitest cases). */
export function clearRateLimitStore(): void {
  requestLog.clear();
  if (sweepTimer !== null) {
    clearInterval(sweepTimer);
    sweepTimer = null;
  }
}

/**
 * Returns `true` if the given IP has exceeded its request quota.
 *
 * @param ip - Client IP address (from `getClientIp`)
 */
export function isRateLimited(ip: string): boolean {
  ensureSweepTimer();

  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const timestamps = requestLog.get(ip);

  // Fast-path: no history for this IP
  if (!timestamps) {
    requestLog.set(ip, [now]);
    return false;
  }

  // Prune expired timestamps (array is insertion-ordered → binary search viable
  // but linear scan is fine for ≤10 items).
  const recent = timestamps.filter((t) => t > cutoff);

  if (recent.length >= MAX_REQUESTS) {
    requestLog.set(ip, recent);
    return true;
  }

  recent.push(now);
  requestLog.set(ip, recent);
  return false;
}

/**
 * Extracts the originating client IP from standard proxy headers.
 *
 * @param req - Incoming Request object
 * @returns First IP in `X-Forwarded-For` or `"unknown"`
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
