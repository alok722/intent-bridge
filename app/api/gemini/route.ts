import { NextResponse } from "next/server";
import { type Part } from "@google/generative-ai";
import { RequestSchema, responseSchemaMap, type ScenarioKey } from "@/lib/schemas";
import { getSystemPrompt } from "@/lib/scenarios";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";
import { maybeTranslateForModel } from "@/lib/cloud-translate";
import { generateGeminiContent, parseMarkedJson } from "@/lib/gemini-service";
import { auditAndReturnResponse, sanitizeErrorMessage } from "@/lib/api-response-utils";
import { reportError } from "@/lib/gcp-error-reporting";

const EMPTY_MODALITIES: { text: boolean; file: boolean; audio: boolean } = {
  text: false,
  file: false,
  audio: false,
};

export async function POST(req: Request) {
  const t0 = Date.now();
  let scenario = "unknown";
  let modalities = EMPTY_MODALITIES;
  let translationApplied = false;

  try {
    const clientIp = getClientIp(req);
    if (isRateLimited(clientIp)) {
      return await auditAndReturnResponse(
        t0,
        NextResponse.json(
          { success: false, error: "Rate limit exceeded. Try again in a minute." },
          { status: 429 },
        ),
        {
          scenario,
          ok: false,
          modalities,
          translationApplied,
          errorKind: "rate_limit",
        },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return await auditAndReturnResponse(
        t0,
        NextResponse.json(
          { success: false, error: "Gemini API key is not configured on the server." },
          { status: 503 },
        ),
        {
          scenario,
          ok: false,
          modalities,
          translationApplied,
          errorKind: "no_api_key",
        },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return await auditAndReturnResponse(
        t0,
        NextResponse.json(
          { success: false, error: "Invalid JSON body." },
          { status: 400 },
        ),
        {
          scenario,
          ok: false,
          modalities,
          translationApplied,
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
        return await auditAndReturnResponse(
          t0,
          NextResponse.json(
            { success: false, error: "Payload exceeds maximum allowed size (10MB)." },
            { status: 413 },
          ),
          {
            scenario,
            ok: false,
            modalities,
            translationApplied,
            errorKind: "payload_size",
          },
        );
      }
      if (hasMime) {
        return await auditAndReturnResponse(
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
            translationApplied,
            errorKind: "mime_type",
          },
        );
      }

      return await auditAndReturnResponse(
        t0,
        NextResponse.json(
          { success: false, error: parsed.error.flatten() },
          { status: 400 },
        ),
        {
          scenario,
          ok: false,
          modalities,
          translationApplied,
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

    let textForModel = textInput;
    if (textInput?.trim()) {
      const tr = await maybeTranslateForModel(textInput);
      textForModel = tr.text;
      translationApplied = tr.applied;
    }

    const contentParts: Part[] = [];
    if (textForModel) contentParts.push({ text: textForModel });
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

    const systemPrompt = getSystemPrompt(scenario as ScenarioKey);
    const { responseText, resolvedModel } = await generateGeminiContent(
      apiKey,
      systemPrompt,
      contentParts,
    );

    let structuredOutput: unknown;
    try {
      structuredOutput = parseMarkedJson(responseText);
    } catch {
      return await auditAndReturnResponse(
        t0,
        NextResponse.json(
          { success: false, error: "Model failed to return valid JSON structure." },
          { status: 500 },
        ),
        {
          scenario,
          ok: false,
          modalities,
          translationApplied,
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

    return await auditAndReturnResponse(
      t0,
      NextResponse.json({ success: true, data: structuredOutput }),
      {
        scenario,
        ok: true,
        modalities,
        translationApplied,
        model: resolvedModel,
      },
    );
  } catch (error: unknown) {
    reportError(error, {
      httpRequest: { method: "POST", url: "/api/gemini" },
      scenario,
    });
    return await auditAndReturnResponse(
      t0,
      NextResponse.json(
        { success: false, error: sanitizeErrorMessage(error) },
        { status: 500 },
      ),
      {
        scenario,
        ok: false,
        modalities,
        translationApplied,
        errorKind: "gemini",
      },
    );
  }
}
