import { describe, it, expect } from "vitest";
import { getSystemPrompt } from "../scenarios";
import type { ScenarioKey } from "../schemas";

describe("getSystemPrompt", () => {
  it("returns medical prompt for 'medical' scenario", () => {
    const prompt = getSystemPrompt("medical");
    expect(prompt).toContain("triageLevel");
    expect(prompt).toContain("icd10Codes");
    expect(prompt).toContain("emergency medical");
  });

  it("returns disaster prompt for 'disaster' scenario", () => {
    const prompt = getSystemPrompt("disaster");
    expect(prompt).toContain("disasterType");
    expect(prompt).toContain("evacuationRoutes");
    expect(prompt).toContain("disaster response");
  });

  it("returns infrastructure prompt for 'infrastructure' scenario", () => {
    const prompt = getSystemPrompt("infrastructure");
    expect(prompt).toContain("damageType");
    expect(prompt).toContain("severityScore");
    expect(prompt).toContain("infrastructure");
  });

  it("returns epidemiology prompt for 'epidemiology' scenario", () => {
    const prompt = getSystemPrompt("epidemiology");
    expect(prompt).toContain("outbreakType");
    expect(prompt).toContain("suspectedPathogen");
    expect(prompt).toContain("epidemiology");
  });

  it("returns traffic prompt for 'traffic' scenario", () => {
    const prompt = getSystemPrompt("traffic");
    expect(prompt).toContain("incidentDescription");
    expect(prompt).toContain("suggestedDetours");
    expect(prompt).toContain("traffic");
  });

  it("falls back to medical prompt for unknown scenario", () => {
    const prompt = getSystemPrompt("unknown_scenario" as ScenarioKey);
    const medicalPrompt = getSystemPrompt("medical");
    expect(prompt).toBe(medicalPrompt);
  });

  it("all prompts instruct JSON-only output", () => {
    const scenarios: ScenarioKey[] = [
      "medical",
      "disaster",
      "infrastructure",
      "epidemiology",
      "traffic",
    ];
    for (const scenario of scenarios) {
      const prompt = getSystemPrompt(scenario);
      expect(prompt.toLowerCase()).toContain("json");
    }
  });

  it("all prompts include confidenceScore in expected output", () => {
    const scenarios: ScenarioKey[] = [
      "medical",
      "disaster",
      "infrastructure",
      "epidemiology",
      "traffic",
    ];
    for (const scenario of scenarios) {
      const prompt = getSystemPrompt(scenario);
      expect(prompt).toContain("confidenceScore");
    }
  });
});
