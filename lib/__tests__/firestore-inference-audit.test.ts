import { describe, it, expect, vi } from "vitest";
import { logInferenceAudit } from "../firestore-inference-audit";

describe("logInferenceAudit", () => {
  it("resolves without touching Firestore when logging is disabled", async () => {
    vi.stubEnv("ENABLE_FIRESTORE_LOG", "");
    await expect(
      logInferenceAudit({
        scenario: "medical",
        ok: true,
        httpStatus: 200,
        latencyMs: 1,
        modalities: { text: true, file: false, audio: false },
      }),
    ).resolves.toBeUndefined();
  });
});
