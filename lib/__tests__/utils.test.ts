import { describe, it, expect } from "vitest";
import { cn, toBase64, formatFieldLabel } from "../utils";

describe("cn", () => {
  it("merges multiple class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("resolves Tailwind conflicts (last wins)", () => {
    const result = cn("p-4", "p-2");
    expect(result).toBe("p-2");
  });

  it("handles undefined and null values", () => {
    expect(cn("a", undefined, null, "b")).toBe("a b");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });

  it("merges complex Tailwind classes", () => {
    const result = cn(
      "text-sm font-bold",
      "text-lg",
    );
    expect(result).toContain("text-lg");
    expect(result).toContain("font-bold");
    expect(result).not.toContain("text-sm");
  });
});

describe("toBase64", () => {
  it("converts a Blob to base64 string", async () => {
    const blob = new Blob(["hello world"], { type: "text/plain" });
    const result = await toBase64(blob);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns a non-empty string for binary data", async () => {
    const buffer = new Uint8Array([0, 1, 2, 3, 255]);
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const result = await toBase64(blob);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("formatFieldLabel", () => {
  it("splits camelCase into spaced words", () => {
    expect(formatFieldLabel("chiefComplaint")).toBe("chief Complaint");
  });

  it("splits PascalCase", () => {
    expect(formatFieldLabel("TriageLevel")).toBe("Triage Level");
  });

  it("handles all-lowercase strings unchanged", () => {
    expect(formatFieldLabel("severity")).toBe("severity");
  });

  it("handles empty string", () => {
    expect(formatFieldLabel("")).toBe("");
  });
});

