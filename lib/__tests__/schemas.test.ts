import { describe, it, expect } from "vitest";
import {
  RequestSchema,
  MedicalResponseSchema,
  DisasterResponseSchema,
  InfrastructureResponseSchema,
  EpidemiologyResponseSchema,
  TrafficResponseSchema,
} from "../schemas";

describe("RequestSchema", () => {
  it("accepts a valid text-only request", () => {
    const result = RequestSchema.safeParse({
      scenario: "medical",
      textInput: "Patient has chest pain",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid request with file data", () => {
    const result = RequestSchema.safeParse({
      scenario: "disaster",
      fileData: { mimeType: "image/jpeg", base64: "abc123==" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid request with audio data", () => {
    const result = RequestSchema.safeParse({
      scenario: "infrastructure",
      audioData: { mimeType: "audio/webm", base64: "xyz789==" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts all valid scenario enum values", () => {
    const scenarios = [
      "medical",
      "disaster",
      "infrastructure",
      "epidemiology",
      "traffic",
    ] as const;
    for (const scenario of scenarios) {
      const result = RequestSchema.safeParse({ scenario, textInput: "test" });
      expect(result.success).toBe(true);
    }
  });

  it("rejects an invalid scenario", () => {
    const result = RequestSchema.safeParse({
      scenario: "invalid_scenario",
      textInput: "test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing scenario field", () => {
    const result = RequestSchema.safeParse({ textInput: "test" });
    expect(result.success).toBe(false);
  });

  it("accepts request with all optional fields omitted", () => {
    const result = RequestSchema.safeParse({ scenario: "medical" });
    expect(result.success).toBe(true);
  });

  it("rejects fileData with missing mimeType", () => {
    const result = RequestSchema.safeParse({
      scenario: "medical",
      fileData: { base64: "abc123" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects fileData with missing base64", () => {
    const result = RequestSchema.safeParse({
      scenario: "medical",
      fileData: { mimeType: "image/png" },
    });
    expect(result.success).toBe(false);
  });
});

describe("MedicalResponseSchema", () => {
  const validMedical = {
    triageLevel: "IMMEDIATE",
    chiefComplaint: "Chest pain",
    vitalsAssessment: { suspected: ["cardiac arrest"] },
    icd10Codes: ["I21.9"],
    immediateActions: ["Administer aspirin"],
    nearestFacilityType: "trauma_center",
    confidenceScore: 0.85,
    reasoning: "Symptoms consistent with MI",
  };

  it("accepts valid medical response", () => {
    const result = MedicalResponseSchema.safeParse(validMedical);
    expect(result.success).toBe(true);
  });

  it("rejects invalid triage level", () => {
    const result = MedicalResponseSchema.safeParse({
      ...validMedical,
      triageLevel: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("rejects confidence score above 1", () => {
    const result = MedicalResponseSchema.safeParse({
      ...validMedical,
      confidenceScore: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects confidence score below 0", () => {
    const result = MedicalResponseSchema.safeParse({
      ...validMedical,
      confidenceScore: -0.1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = MedicalResponseSchema.safeParse({
      triageLevel: "URGENT",
    });
    expect(result.success).toBe(false);
  });
});

describe("DisasterResponseSchema", () => {
  const validDisaster = {
    disasterType: "Flood",
    severityLevel: 4,
    affectedRadius: "5km",
    evacuationRoutes: [{ route: "Highway 101 North", capacity: "500 vehicles/hr" }],
    resourcesNeeded: ["Boats", "Medical kits"],
    dispatchOrders: ["Deploy rescue team alpha"],
    estimatedAffected: 10000,
    confidenceScore: 0.75,
  };

  it("accepts valid disaster response", () => {
    const result = DisasterResponseSchema.safeParse(validDisaster);
    expect(result.success).toBe(true);
  });

  it("rejects severity level above 5", () => {
    const result = DisasterResponseSchema.safeParse({
      ...validDisaster,
      severityLevel: 6,
    });
    expect(result.success).toBe(false);
  });

  it("rejects severity level below 1", () => {
    const result = DisasterResponseSchema.safeParse({
      ...validDisaster,
      severityLevel: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("InfrastructureResponseSchema", () => {
  const validInfra = {
    damageType: "Bridge structural failure",
    severityScore: 8,
    urgency: "CRITICAL",
    workOrderType: "Emergency repair",
    estimatedRepairTime: "72 hours",
    safetyHazards: ["Collapse risk"],
    requiredCrews: ["Structural engineering team"],
    confidenceScore: 0.9,
  };

  it("accepts valid infrastructure response", () => {
    const result = InfrastructureResponseSchema.safeParse(validInfra);
    expect(result.success).toBe(true);
  });

  it("rejects invalid urgency enum", () => {
    const result = InfrastructureResponseSchema.safeParse({
      ...validInfra,
      urgency: "SUPER_CRITICAL",
    });
    expect(result.success).toBe(false);
  });

  it("rejects severity score above 10", () => {
    const result = InfrastructureResponseSchema.safeParse({
      ...validInfra,
      severityScore: 11,
    });
    expect(result.success).toBe(false);
  });
});

describe("EpidemiologyResponseSchema", () => {
  const validEpi = {
    outbreakType: "Respiratory illness cluster",
    severity: "HIGH",
    suspectedPathogen: "Influenza A H1N1",
    recommendationLevel: "Regional alert",
    suggestedDraft: "Public health advisory draft text",
    confidenceScore: 0.7,
  };

  it("accepts valid epidemiology response", () => {
    const result = EpidemiologyResponseSchema.safeParse(validEpi);
    expect(result.success).toBe(true);
  });

  it("rejects invalid severity enum", () => {
    const result = EpidemiologyResponseSchema.safeParse({
      ...validEpi,
      severity: "EXTREME",
    });
    expect(result.success).toBe(false);
  });
});

describe("TrafficResponseSchema", () => {
  const validTraffic = {
    incidentDescription: "Multi-vehicle pileup on I-405",
    impactDurationMinutes: 120,
    suggestedDetours: ["Take Route 1 via Main St"],
    notifiedParties: ["Highway Patrol", "Fire Department"],
    confidenceScore: 0.8,
  };

  it("accepts valid traffic response", () => {
    const result = TrafficResponseSchema.safeParse(validTraffic);
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = TrafficResponseSchema.safeParse({
      incidentDescription: "Accident",
    });
    expect(result.success).toBe(false);
  });
});
