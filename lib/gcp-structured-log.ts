import type { InferenceAuditPayload } from "@/lib/firestore-inference-audit";

/** Cloud Run sets K_SERVICE; structured JSON is picked up by Cloud Logging. */
function shouldEmitStructuredJson(): boolean {
  return (
    process.env.ENABLE_STRUCTURED_LOG === "true" ||
    process.env.K_SERVICE !== undefined
  );
}

function severityFor(status: number): string {
  if (status >= 500) return "ERROR";
  if (status >= 400) return "WARNING";
  return "INFO";
}

/**
 * Emits a single JSON line to stdout for Google Cloud Logging
 * (special json fields per structured logging on Cloud Run).
 */
export function writeInferenceStructuredLog(payload: InferenceAuditPayload): void {
  if (!shouldEmitStructuredJson()) return;

  const line = JSON.stringify({
    severity: severityFor(payload.httpStatus),
    message: "intent_bridge_inference",
    "logging.googleapis.com/labels": {
      service: "intent-bridge",
      scenario: payload.scenario,
    },
    inference: {
      scenario: payload.scenario,
      ok: payload.ok,
      httpStatus: payload.httpStatus,
      latencyMs: payload.latencyMs,
      modalities: payload.modalities,
      model: payload.model,
      errorKind: payload.errorKind,
      translationApplied: payload.translationApplied ?? false,
    },
  });

  console.log(line);
}
