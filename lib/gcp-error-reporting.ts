/**
 * Google Cloud Error Reporting integration.
 *
 * On Cloud Run (K_SERVICE is set), errors are reported as structured JSON
 * that Google Cloud Error Reporting automatically ingests. Locally, errors
 * are simply logged to stderr.
 *
 * @see https://cloud.google.com/error-reporting/docs/formatting-error-messages
 */

interface ErrorReportContext {
  /** HTTP method + path that caused the error */
  httpRequest?: { method: string; url: string };
  /** Which pipeline scenario was active */
  scenario?: string;
  /** Custom labels for error grouping */
  labels?: Record<string, string>;
}

function isCloudRun(): boolean {
  return process.env.K_SERVICE !== undefined;
}

/**
 * Reports an error to Google Cloud Error Reporting (via structured logging)
 * or console.error locally.
 *
 * @param error - The error to report
 * @param context - Additional context for the error report
 */
export function reportError(error: unknown, context?: ErrorReportContext): void {
  const errorMessage =
    error instanceof Error ? error.message : String(error);
  const stack =
    error instanceof Error ? error.stack : new Error(errorMessage).stack;

  if (!isCloudRun()) {
    console.error("[Error Report]", errorMessage, context);
    return;
  }

  // Cloud Error Reporting picks up this JSON structure automatically
  const report = {
    severity: "ERROR",
    message: stack ?? errorMessage,
    "@type": "type.googleapis.com/google.devtools.clouderrorreporting.v1beta1.ReportedErrorEvent",
    context: {
      httpRequest: context?.httpRequest,
      reportLocation: {
        functionName: context?.scenario ?? "unknown",
      },
    },
    serviceContext: {
      service: process.env.K_SERVICE ?? "intent-bridge",
      version: process.env.K_REVISION ?? "dev",
    },
    "logging.googleapis.com/labels": {
      ...context?.labels,
      scenario: context?.scenario ?? "unknown",
    },
  };

  // stdout JSON is ingested by Cloud Logging → Error Reporting
  console.log(JSON.stringify(report));
}
