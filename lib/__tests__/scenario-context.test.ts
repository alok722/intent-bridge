import { describe, it, expect } from "vitest";
import { getScenarioAssistantContext } from "../scenario-context";

describe("getScenarioAssistantContext", () => {
  it("returns distinct focus strings per domain", () => {
    const medical = getScenarioAssistantContext("medical");
    const traffic = getScenarioAssistantContext("traffic");
    expect(medical.focus).not.toBe(traffic.focus);
    expect(medical.reasoning).toContain("emergency-medicine");
    expect(traffic.reasoning).toContain("Traffic context");
  });

  it("includes expected output hints for each domain", () => {
    const domains = [
      "medical",
      "disaster",
      "infrastructure",
      "epidemiology",
      "traffic",
    ] as const;
    for (const d of domains) {
      const ctx = getScenarioAssistantContext(d);
      expect(ctx.expectedOutputs.length).toBeGreaterThan(0);
    }
  });
});
