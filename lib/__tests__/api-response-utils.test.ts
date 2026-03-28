import { describe, it, expect, vi, beforeEach } from "vitest";
import { sanitizeErrorMessage } from "../api-response-utils";

describe("sanitizeErrorMessage", () => {
  beforeEach(() => {
    vi.stubEnv("GEMINI_API_KEY", "super-secret-key");
  });

  it("strips API key from error messages", () => {
    const err = new Error("Request failed: super-secret-key is invalid");
    const result = sanitizeErrorMessage(err);
    expect(result).not.toContain("super-secret-key");
    expect(result).toContain("authentication");
  });

  it("redacts messages containing sensitive keywords", () => {
    const err = new Error("Invalid token for service account");
    expect(sanitizeErrorMessage(err)).toContain("configuration error");
  });

  it("passes through generic Error messages unchanged", () => {
    const err = new Error("Model timeout after 30s");
    expect(sanitizeErrorMessage(err)).toBe("Model timeout after 30s");
  });

  it("returns generic message for non-Error values", () => {
    expect(sanitizeErrorMessage("string error")).toBe("AI generation failed");
    expect(sanitizeErrorMessage(42)).toBe("AI generation failed");
    expect(sanitizeErrorMessage(null)).toBe("AI generation failed");
  });
});
