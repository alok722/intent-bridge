import { NextResponse } from "next/server";
import {
  logInferenceAudit,
  type InferenceAuditPayload,
} from "@/lib/firestore-inference-audit";
import { writeInferenceStructuredLog } from "@/lib/gcp-structured-log";

/**
 * Sensitive-value patterns that MUST be scrubbed from user-facing error messages.
 * Prevents API key / token leakage in JSON responses.
 */
const SENSITIVE_PATTERNS = /key|token|secret|credential/i;

/**
 * Strips secrets from error messages before they are sent to the client.
 *
 * @param error - The caught error (may be non-Error in edge cases)
 * @returns A safe, user-facing error string
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "AI generation failed";
  }

  const msg = error.message;
  const apiKey = process.env.GEMINI_API_KEY ?? "";

  if (apiKey && msg.includes(apiKey)) {
    return "AI generation failed due to an authentication error.";
  }
  if (SENSITIVE_PATTERNS.test(msg)) {
    return "AI generation failed due to a configuration error.";
  }
  return msg;
}

/**
 * Convenience helper that records audit metadata (Firestore + Cloud Logging)
 * then returns the prepared {@link NextResponse}.
 *
 * @param t0 - Request start timestamp from `Date.now()`
 * @param res - The NextResponse to return to the caller
 * @param partial - Audit fields excluding httpStatus/latencyMs (derived here)
 */
export async function auditAndReturnResponse(
  t0: number,
  res: NextResponse,
  partial: Omit<InferenceAuditPayload, "httpStatus" | "latencyMs">,
): Promise<NextResponse> {
  const payload: InferenceAuditPayload = {
    ...partial,
    httpStatus: res.status,
    latencyMs: Date.now() - t0,
  };

  // Fire-and-forget audit — never blocks the response
  await Promise.all([
    logInferenceAudit(payload),
    Promise.resolve(writeInferenceStructuredLog(payload)),
  ]);

  return res;
}
