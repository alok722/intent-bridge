import { describe, it, expect, vi, beforeEach } from "vitest";
import { reportError } from "../gcp-error-reporting";

describe("gcp-error-reporting", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("logs to console.error locally (no K_SERVICE)", () => {
    vi.stubEnv("K_SERVICE", "");
    delete process.env.K_SERVICE;
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    reportError(new Error("test failure"), { scenario: "medical" });
    expect(spy).toHaveBeenCalledWith(
      "[Error Report]",
      "test failure",
      expect.objectContaining({ scenario: "medical" }),
    );
  });

  it("emits structured JSON on Cloud Run (K_SERVICE set)", () => {
    vi.stubEnv("K_SERVICE", "intent-bridge");
    vi.stubEnv("K_REVISION", "rev-001");
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    reportError(new Error("production failure"), {
      scenario: "disaster",
      httpRequest: { method: "POST", url: "/api/gemini" },
    });
    expect(spy).toHaveBeenCalledOnce();
    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.severity).toBe("ERROR");
    expect(parsed["@type"]).toContain("ReportedErrorEvent");
    expect(parsed.serviceContext.service).toBe("intent-bridge");
    expect(parsed.context.httpRequest.method).toBe("POST");
  });

  it("handles non-Error values gracefully", () => {
    vi.stubEnv("K_SERVICE", "");
    delete process.env.K_SERVICE;
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    reportError("plain string error");
    expect(spy).toHaveBeenCalledWith(
      "[Error Report]",
      "plain string error",
      undefined,
    );
  });
});
