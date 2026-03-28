import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { writeInferenceStructuredLog } from "../gcp-structured-log";

describe("writeInferenceStructuredLog", () => {
  beforeEach(() => {
    delete process.env.K_SERVICE;
    vi.stubEnv("ENABLE_STRUCTURED_LOG", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("writes JSON to console when ENABLE_STRUCTURED_LOG=true", () => {
    vi.stubEnv("ENABLE_STRUCTURED_LOG", "true");
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    writeInferenceStructuredLog({
      scenario: "medical",
      ok: true,
      httpStatus: 200,
      latencyMs: 12,
      modalities: { text: true, file: false, audio: false },
      model: "gemini-2.5-flash",
    });

    expect(log).toHaveBeenCalledTimes(1);
    const arg = log.mock.calls[0][0] as string;
    const parsed = JSON.parse(arg);
    expect(parsed.severity).toBe("INFO");
    expect(parsed.message).toBe("intent_bridge_inference");
    expect(parsed.inference.scenario).toBe("medical");
    expect(parsed.inference.translationApplied).toBe(false);

    log.mockRestore();
  });

  it("no-ops when neither flag nor Cloud Run env is set", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    writeInferenceStructuredLog({
      scenario: "traffic",
      ok: false,
      httpStatus: 500,
      latencyMs: 5,
      modalities: { text: false, file: false, audio: false },
      errorKind: "gemini",
    });

    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });
});
