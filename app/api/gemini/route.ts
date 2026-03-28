import { NextResponse } from "next/server";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { RequestSchema, responseSchemaMap, type ScenarioKey } from "@/lib/schemas";
import { getSystemPrompt } from "@/lib/scenarios";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";
import {
  logInferenceAudit,
  type InferenceAuditPayload,
} from "@/lib/firestore-inference-audit";

const PRIMARY_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.0-flash";

const EMPTY_MODALITIES = { text: false, file: false, audio: false };

function shouldTryFallback(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    /\b429\b/.test(msg) ||
    /quota/i.test(msg) ||
    /\b404\b/.test(msg) ||
    /NOT_FOUND/i.test(msg) ||
    /is not (found|supported)/i.test(msg)
  );
}

function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message;
    const apiKey = process.env.GEMINI_API_KEY ?? "";
    if (apiKey && msg.includes(apiKey)) {
      return "AI generation failed due to an authentication error.";
    }
    if (/key|token|secret|credential/i.test(msg)) {
      return "AI generation failed due to a configuration error.";
    }
    return msg;
  }
  return "AI generation failed";
}

async function auditAndReturn(
  t0: number,
  res: NextResponse,
  partial: Omit<InferenceAuditPayload, "httpStatus" | "latencyMs">,
) {
  await logInferenceAudit({
    ...partial,
    httpStatus: res.status,
    latencyMs: Date.now() - t0,
  });
  return res;
}

export async function POST(req: Request) {
  const t0 = Date.now();
  let scenario = "unknown";
  let modalities = EMPTY_MODALITIES;

  try {
    const clientIp = getClientIp(req);
    if (isRateLimited(clientIp)) {
      return await auditAndReturn(
        t0,
        NextResponse.json(
          { success: false, error: "Rate limit exceeded. Try again in a minute." },
          { status: 429 },
        ),
        {
          scenario,
          ok: false,
          modalities,
          errorKind: "rate_limit",
        },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return await auditAndReturn(
        t0,
        NextResponse.json(
          { success: false, error: "Gemini API key is not configured on the server." },
          { status: 503 },
        ),
        {
          scenario,
          ok: false,
          modalities,
          errorKind: "no_api_key",
        },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return await auditAndReturn(
        t0,
        NextResponse.json(
          { success: false, error: "Invalid JSON body." },
          { status: 400 },
        ),
        {
          scenario,
          ok: false,
          modalities,
          errorKind: "invalid_json",
        },
      );
    }

    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      const issues = parsed.error.issues;
      const hasMime = issues.some((i) => i.message.includes("file type") || i.message.includes("audio type"));
      const hasSize = issues.some((i) => i.message.includes("10MB"));
      const rawScenario = (body as { scenario?: string })?.scenario;
      if (typeof rawScenario === "string") scenario = rawScenario;

      if (hasSize) {
        return await auditAndReturn(
          t0,
          NextResponse.json(
            { success: false, error: "Payload exceeds maximum allowed size (10MB)." },
            { status: 413 },
          ),
          {
            scenario,
            ok: false,
            modalities,
            errorKind: "payload_size",
          },
        );
      }
      if (hasMime) {
        return await auditAndReturn(
          t0,
          NextResponse.json(
            {
              success: false,
              error:
                "Unsupported file type. Allowed: JPEG, PNG, WebP, GIF, PDF, WebM, MP4, OGG, MPEG.",
            },
            { status: 400 },
          ),
          {
            scenario,
            ok: false,
            modalities,
            errorKind: "mime_type",
          },
        );
      }

      return await auditAndReturn(
        t0,
        NextResponse.json(
          { success: false, error: parsed.error.flatten() },
          { status: 400 },
        ),
        {
          scenario,
          ok: false,
          modalities,
          errorKind: "validation",
        },
      );
    }

    const { scenario: sc, textInput, fileData, audioData } = parsed.data;
    scenario = sc;
    modalities = {
      text: Boolean(textInput),
      file: Boolean(fileData),
      audio: Boolean(audioData),
    };

    const contentParts: Part[] = [];
    if (textInput) contentParts.push({ text: textInput });
    if (fileData) {
      contentParts.push({
        inlineData: { mimeType: fileData.mimeType, data: fileData.base64 },
      });
    }
    if (audioData) {
      contentParts.push({
        inlineData: { mimeType: audioData.mimeType, data: audioData.base64 },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const systemPrompt = getSystemPrompt(scenario as ScenarioKey);
    const models = [PRIMARY_MODEL, FALLBACK_MODEL];

    let responseText: string | undefined;
    let lastError: unknown;
    let resolvedModel: string | undefined;

    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
        });

        const result = await model.generateContent({
          contents: [{ role: "user", parts: contentParts }],
        });
        responseText = result.response.text();
        resolvedModel = modelName;
        break;
      } catch (err: unknown) {
        lastError = err;
        if (!shouldTryFallback(err) || modelName === models[models.length - 1]) {
          throw err;
        }
        console.warn(`Model ${modelName} failed, trying fallback.`);
      }
    }

    if (responseText === undefined) {
      throw lastError ?? new Error("No model produced a response");
    }

    const jsonMatch = responseText.match(/```(?:json)?\n?([\s\S]*?)\n?```/) || [
      null,
      responseText,
    ];
    let structuredOutput: unknown;
    try {
      structuredOutput = JSON.parse(jsonMatch[1] ?? responseText);
    } catch {
      return await auditAndReturn(
        t0,
        NextResponse.json(
          { success: false, error: "Model failed to return valid JSON structure." },
          { status: 500 },
        ),
        {
          scenario,
          ok: false,
          modalities,
          model: resolvedModel,
          errorKind: "json_parse",
        },
      );
    }

    const responseSchema = responseSchemaMap[scenario as ScenarioKey];
    if (responseSchema) {
      const validation = responseSchema.safeParse(structuredOutput);
      if (!validation.success) {
        console.warn("Response schema validation failed:", validation.error.issues);
      }
    }

    return await auditAndReturn(
      t0,
      NextResponse.json({ success: true, data: structuredOutput }),
      {
        scenario,
        ok: true,
        modalities,
        model: resolvedModel,
      },
    );
  } catch (error: unknown) {
    console.error("Gemini API Error:", error);
    return await auditAndReturn(
      t0,
      NextResponse.json(
        { success: false, error: sanitizeError(error) },
        { status: 500 },
      ),
      {
        scenario,
        ok: false,
        modalities,
        errorKind: "gemini",
      },
    );
  }
}
