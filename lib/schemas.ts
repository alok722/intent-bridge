import { z } from "zod";

export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
] as const;

export const ALLOWED_AUDIO_TYPES = [
  "audio/webm",
  "audio/mp4",
  "audio/ogg",
  "audio/mpeg",
] as const;

const ALLOWED_MIME_TYPES = [...ALLOWED_FILE_TYPES, ...ALLOWED_AUDIO_TYPES];

const MAX_PAYLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

const base64WithSizeCheck = z.string().refine(
  (val) => {
    const sizeInBytes = Math.ceil((val.length * 3) / 4);
    return sizeInBytes <= MAX_PAYLOAD_BYTES;
  },
  { message: "Payload exceeds maximum allowed size (10MB)" },
);

export const RequestSchema = z.object({
  scenario: z.enum([
    "medical",
    "disaster",
    "infrastructure",
    "epidemiology",
    "traffic",
  ]),
  textInput: z.string().optional(),
  fileData: z
    .object({
      mimeType: z.string().refine((v) => ALLOWED_MIME_TYPES.includes(v as (typeof ALLOWED_MIME_TYPES)[number]), {
        message: "Unsupported file type. Allowed: JPEG, PNG, WebP, GIF, PDF, WebM, MP4, OGG, MPEG.",
      }),
      base64: base64WithSizeCheck,
    })
    .optional(),
  audioData: z
    .object({
      mimeType: z.string().refine((v) => ALLOWED_AUDIO_TYPES.includes(v as (typeof ALLOWED_AUDIO_TYPES)[number]), {
        message: "Unsupported audio type. Allowed: WebM, MP4, OGG, MPEG.",
      }),
      base64: base64WithSizeCheck,
    })
    .optional(),
});

export type IntentRequest = z.infer<typeof RequestSchema>;

export const SCENARIO_KEYS = [
  "medical",
  "disaster",
  "infrastructure",
  "epidemiology",
  "traffic",
] as const;
export type ScenarioKey = (typeof SCENARIO_KEYS)[number];

export const MedicalResponseSchema = z.object({
  triageLevel: z.enum(["IMMEDIATE", "URGENT", "DELAYED", "MINIMAL"]),
  chiefComplaint: z.string(),
  vitalsAssessment: z.object({ suspected: z.array(z.string()) }),
  icd10Codes: z.array(z.string()),
  immediateActions: z.array(z.string()),
  nearestFacilityType: z.enum(["trauma_center", "er", "urgent_care"]),
  confidenceScore: z.number().min(0).max(1),
  reasoning: z.string(),
});

export const DisasterResponseSchema = z.object({
  disasterType: z.string(),
  severityLevel: z.number().min(1).max(5),
  affectedRadius: z.string(),
  evacuationRoutes: z.array(
    z.object({ route: z.string(), capacity: z.string() }),
  ),
  resourcesNeeded: z.array(z.string()),
  dispatchOrders: z.array(z.string()),
  estimatedAffected: z.number(),
  confidenceScore: z.number().min(0).max(1),
});

export const InfrastructureResponseSchema = z.object({
  damageType: z.string(),
  severityScore: z.number().min(1).max(10),
  urgency: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  workOrderType: z.string(),
  estimatedRepairTime: z.string(),
  safetyHazards: z.array(z.string()),
  requiredCrews: z.array(z.string()),
  confidenceScore: z.number().min(0).max(1),
});

export const EpidemiologyResponseSchema = z.object({
  outbreakType: z.string(),
  severity: z.enum(["CRITICAL", "HIGH", "MODERATE", "LOW"]),
  suspectedPathogen: z.string(),
  recommendationLevel: z.string(),
  suggestedDraft: z.string(),
  confidenceScore: z.number().min(0).max(1),
});

export const TrafficResponseSchema = z.object({
  incidentDescription: z.string(),
  impactDurationMinutes: z.number(),
  suggestedDetours: z.array(z.string()),
  notifiedParties: z.array(z.string()),
  confidenceScore: z.number().min(0).max(1),
});

export const responseSchemaMap: Record<ScenarioKey, z.ZodType> = {
  medical: MedicalResponseSchema,
  disaster: DisasterResponseSchema,
  infrastructure: InfrastructureResponseSchema,
  epidemiology: EpidemiologyResponseSchema,
  traffic: TrafficResponseSchema,
};
