import type { ScenarioDomain } from "@/store/intent-store";

export interface ScenarioAssistantContext {
  /** What the assistant optimizes for in this domain */
  focus: string;
  /** How routing / prompts change based on user-selected context */
  reasoning: string;
  /** Structured outputs the model is steered toward */
  expectedOutputs: string[];
}

const CONTEXT_BY_DOMAIN: Record<ScenarioDomain, ScenarioAssistantContext> = {
  medical: {
    focus: "Clinical triage and time-critical routing",
    reasoning:
      "User context selects emergency-medicine system instructions so the model prioritizes acuity, differential vitals, ICD-10 coding, and facility type—not generic Q&A.",
    expectedOutputs: [
      "Triage level (ESI-style bucket)",
      "ICD-10 candidates",
      "Immediate actions + nearest facility class",
    ],
  },
  disaster: {
    focus: "Incident scale, evacuation, and resource coordination",
    reasoning:
      "Disaster mode steers Gemini toward severity scales, affected radius, evacuation routes, and dispatch orders aligned with ICS-style response.",
    expectedOutputs: [
      "Severity (1–5) + disaster type",
      "Evacuation routes with capacity hints",
      "Resource and dispatch lists",
    ],
  },
  infrastructure: {
    focus: "Asset damage, risk, and work-order readiness",
    reasoning:
      "Infrastructure context emphasizes severity scores, municipal work-order fields, crew types, and safety hazards for public works—not medical triage.",
    expectedOutputs: [
      "Damage class + urgency tier",
      "Work order type + ETA band",
      "Safety hazards + required crews",
    ],
  },
  epidemiology: {
    focus: "Outbreak signals and public communication",
    reasoning:
      "Epidemiology mode shifts extraction toward pathogen hypotheses, advisory level, and draft public messaging suitable for health departments.",
    expectedOutputs: [
      "Outbreak type + severity band",
      "Suspected pathogen + recommendation tier",
      "Suggested advisory draft",
    ],
  },
  traffic: {
    focus: "Network impact and stakeholder notification",
    reasoning:
      "Traffic context targets incident duration, detours, and parties to notify—routing logic distinct from disaster-wide evacuation.",
    expectedOutputs: [
      "Impact window (minutes)",
      "Ordered detours",
      "Notified parties list",
    ],
  },
};

export function getScenarioAssistantContext(
  domain: ScenarioDomain,
): ScenarioAssistantContext {
  return CONTEXT_BY_DOMAIN[domain];
}
