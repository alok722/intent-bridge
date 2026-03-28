/**
 * Google Analytics 4 (GA4) integration via gtag.js.
 *
 * Enabled when NEXT_PUBLIC_GA_MEASUREMENT_ID is set (e.g., "G-XXXXXXXXXX").
 * Events are typed and batched through the global `gtag()` helper.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

/** Whether GA tracking is configured and available. */
export function isAnalyticsEnabled(): boolean {
  return GA_ID.length > 0 && typeof window !== "undefined";
}

/** Returns the GA measurement ID (empty string if unconfigured). */
export function getGaMeasurementId(): string {
  return GA_ID;
}

// ── Custom event tracking ───────────────────────────────────────────────

export type AnalyticsEvent =
  | { name: "scenario_selected"; params: { scenario: string } }
  | { name: "intent_submitted"; params: { scenario: string; modalities: string } }
  | { name: "intent_result"; params: { scenario: string; latency_ms: number; success: boolean } }
  | { name: "dispatch_clicked"; params: { scenario: string } };

/**
 * Sends a typed custom event to GA4.
 * No-ops silently if analytics is not enabled.
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (!isAnalyticsEnabled() || !window.gtag) return;
  window.gtag("event", event.name, event.params);
}

/**
 * Tracks a page view. Automatically called by the GA script component
 * but can be manually triggered for soft navigations.
 */
export function trackPageView(url: string): void {
  if (!isAnalyticsEnabled() || !window.gtag) return;
  window.gtag("config", GA_ID, { page_path: url });
}
