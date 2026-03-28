import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateGeminiContent, parseMarkedJson } from "../gemini-service";

const mockGenerateContent = vi.fn();

vi.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return { generateContent: mockGenerateContent };
      }
    },
  };
});

describe("gemini-service", () => {
  beforeEach(() => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubEnv("GEMINI_MODEL", "gemini-2.5-flash");
    mockGenerateContent.mockClear();
  });

  describe("generateGeminiContent", () => {
    it("returns response text and resolved model on success", async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => "success response" },
      });

      const result = await generateGeminiContent("test-key", "system prompt", []);
      expect(result.responseText).toBe("success response");
      expect(result.resolvedModel).toBe("gemini-2.5-flash");
    });

    it("tries fallback model on specific errors", async () => {
      // First call fails with 429
      mockGenerateContent.mockRejectedValueOnce(new Error("429 Too Many Requests"));
      // Second call succeeds
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => "fallback response" },
      });

      const result = await generateGeminiContent("test-key", "system prompt", []);
      expect(result.responseText).toBe("fallback response");
      expect(result.resolvedModel).toBe("gemini-2.0-flash");
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });

    it("throws error if all models fail", async () => {
      mockGenerateContent.mockRejectedValue(new Error("500 Internal Error"));

      await expect(generateGeminiContent("test-key", "system prompt", [])).rejects.toThrow("500 Internal Error");
    });
  });

  describe("parseMarkedJson", () => {
    it("parses JSON from markdown fences", () => {
      const input = "```json\n{\"foo\": \"bar\"}\n```";
      const result = parseMarkedJson(input);
      expect(result).toEqual({ foo: "bar" });
    });

    it("parses raw JSON string", () => {
      const input = "{\"foo\": \"bar\"}";
      const result = parseMarkedJson(input);
      expect(result).toEqual({ foo: "bar" });
    });

    it("throws on invalid JSON", () => {
      const input = "not json";
      expect(() => parseMarkedJson(input)).toThrow();
    });
  });
});
