import { GoogleGenerativeAI, type Part } from "@google/generative-ai";

/** Default model; override via GEMINI_MODEL env var. */
const PRIMARY_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
/** Fallback when the primary returns 429 / quota / 404 errors. */
const FALLBACK_MODEL = "gemini-2.0-flash";

/**
 * Cached GoogleGenerativeAI instance per API key to avoid re-allocation
 * on every request (v8 object creation + internal setup).
 */
let cachedClient: { key: string; instance: GoogleGenerativeAI } | null = null;

function getClient(apiKey: string): GoogleGenerativeAI {
  if (cachedClient && cachedClient.key === apiKey) {
    return cachedClient.instance;
  }
  const instance = new GoogleGenerativeAI(apiKey);
  cachedClient = { key: apiKey, instance };
  return instance;
}

/** Error patterns that warrant falling back to a secondary model. */
const FALLBACK_PATTERNS: RegExp[] = [
  /\b429\b/,
  /quota/i,
  /\b404\b/,
  /NOT_FOUND/i,
  /is not (found|supported)/i,
];

function shouldTryFallback(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return FALLBACK_PATTERNS.some((re) => re.test(msg));
}

/** Result shape returned by {@link generateGeminiContent}. */
export interface GeminiContentResult {
  /** Raw text response from the model. */
  responseText: string;
  /** The model identifier that produced the response. */
  resolvedModel: string;
}

/**
 * Sends content parts to Gemini with automatic model fallback.
 *
 * @param apiKey - Google AI Studio API key
 * @param systemPrompt - System instruction sent to the model
 * @param contentParts - User content (text/inline-data) parts
 * @returns Structured result with response text and resolved model name
 * @throws Re-throws the underlying SDK error when no model succeeds
 */
export async function generateGeminiContent(
  apiKey: string,
  systemPrompt: string,
  contentParts: Part[],
): Promise<GeminiContentResult> {
  const genAI = getClient(apiKey);
  const models = [PRIMARY_MODEL, FALLBACK_MODEL] as const;

  let lastError: unknown;

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: contentParts }],
      });

      return { responseText: result.response.text(), resolvedModel: modelName };
    } catch (err: unknown) {
      lastError = err;
      const isLast = modelName === models[models.length - 1];
      if (!shouldTryFallback(err) || isLast) {
        throw err;
      }
      console.warn(`Model ${modelName} failed, trying fallback.`);
    }
  }

  // Unreachable in practice — the loop either returns or throws.
  throw lastError ?? new Error("No model produced a response");
}

/**
 * Extracts JSON from a model response that may be wrapped in
 * markdown code fences (` ```json ... ``` `).
 *
 * @throws {SyntaxError} if inner content is not valid JSON
 */
export function parseMarkedJson(text: string): unknown {
  const fenceMatch = text.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
  const raw = fenceMatch ? fenceMatch[1] : text;
  return JSON.parse(raw);
}
