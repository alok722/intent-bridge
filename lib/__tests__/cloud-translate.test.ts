import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { maybeTranslateForModel } from "../cloud-translate";

describe("maybeTranslateForModel", () => {
  beforeEach(() => {
    vi.stubEnv("ENABLE_CLOUD_TRANSLATE", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns original text when Cloud Translate is disabled", async () => {
    const result = await maybeTranslateForModel("Bonjour le monde");
    expect(result).toEqual({ text: "Bonjour le monde", applied: false });
  });

  it("returns original text for whitespace-only input", async () => {
    vi.stubEnv("ENABLE_CLOUD_TRANSLATE", "true");
    const result = await maybeTranslateForModel("   ");
    expect(result.applied).toBe(false);
  });
});
