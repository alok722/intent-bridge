import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";

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

function createRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/gemini", () => {
  beforeEach(() => {
    vi.stubEnv("GEMINI_API_KEY", "test-api-key");
    vi.stubEnv("GEMINI_MODEL", "gemini-2.5-flash");
  });

  it("returns 400 for invalid request body", async () => {
    const req = createRequest({ invalid: true });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("returns 400 for missing scenario field", async () => {
    const req = createRequest({ textInput: "test" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid scenario enum", async () => {
    const req = createRequest({
      scenario: "invalid",
      textInput: "test",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 503 when GEMINI_API_KEY is not set", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const req = createRequest({
      scenario: "medical",
      textInput: "Patient has fever",
    });
    const res = await POST(req);
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error).toContain("API key");
  });

  it("returns 400 for disallowed MIME type", async () => {
    const req = createRequest({
      scenario: "medical",
      fileData: {
        mimeType: "application/exe",
        base64: "dGVzdA==",
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("file type");
  });

  it("returns 413 for oversized payload", async () => {
    const largeBase64 = "A".repeat(15_000_000);
    const req = createRequest({
      scenario: "medical",
      fileData: {
        mimeType: "image/jpeg",
        base64: largeBase64,
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(413);
  });

  it("returns 200 with structured data on success", async () => {
    const mockOutput = {
      triageLevel: "URGENT",
      chiefComplaint: "Chest pain",
      confidenceScore: 0.85,
    };
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify(mockOutput),
      },
    });

    const req = createRequest({
      scenario: "medical",
      textInput: "Patient reports chest pain",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
  });

  it("handles Gemini response wrapped in markdown fences", async () => {
    const mockOutput = { triageLevel: "DELAYED", confidenceScore: 0.5 };
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => "```json\n" + JSON.stringify(mockOutput) + "\n```",
      },
    });

    const req = createRequest({
      scenario: "medical",
      textInput: "Minor scrape",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("returns 500 when Gemini returns non-JSON", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => "I cannot process this request properly",
      },
    });

    const req = createRequest({
      scenario: "medical",
      textInput: "test",
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("does not leak API key in error responses", async () => {
    mockGenerateContent.mockRejectedValue(
      new Error("API key test-api-key is invalid"),
    );

    const req = createRequest({
      scenario: "medical",
      textInput: "test",
    });
    const res = await POST(req);
    const data = await res.json();
    expect(JSON.stringify(data)).not.toContain("test-api-key");
  });
});
