import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useIntentStore } from "../intent-store";

beforeEach(() => {
  useIntentStore.getState().reset();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useIntentStore", () => {
  describe("initial state", () => {
    it("has medical as default scenario", () => {
      expect(useIntentStore.getState().form.scenario).toBe("medical");
    });

    it("starts in IDLE stage", () => {
      expect(useIntentStore.getState().currentStage).toBe("IDLE");
    });

    it("has no output data", () => {
      expect(useIntentStore.getState().outputData).toBeNull();
    });

    it("has no error", () => {
      expect(useIntentStore.getState().error).toBeNull();
    });
  });

  describe("setScenario", () => {
    it("updates the scenario", () => {
      useIntentStore.getState().setScenario("disaster");
      expect(useIntentStore.getState().form.scenario).toBe("disaster");
    });

    it("clears output data when switching scenario", () => {
      const store = useIntentStore.getState();
      useIntentStore.setState({ outputData: { test: true } });
      store.setScenario("traffic");
      expect(useIntentStore.getState().outputData).toBeNull();
    });

    it("clears error when switching scenario", () => {
      useIntentStore.setState({ error: "some error" });
      useIntentStore.getState().setScenario("infrastructure");
      expect(useIntentStore.getState().error).toBeNull();
    });

    it("resets stage to IDLE", () => {
      useIntentStore.setState({ currentStage: "ACT" });
      useIntentStore.getState().setScenario("epidemiology");
      expect(useIntentStore.getState().currentStage).toBe("IDLE");
    });

    it("clears all form data and revokes URLs when switching scenario", () => {
      const fileData = {
        mimeType: "image/png",
        base64: "abc",
        previewUrl: "blob:http://localhost/1",
      };
      const audioData = {
        mimeType: "audio/webm",
        base64: "def",
        audioUrl: "blob:http://localhost/2",
      };
      useIntentStore.getState().setTextInput("field notes");
      useIntentStore.setState({
        form: { ...useIntentStore.getState().form, fileData, audioData },
      });
      const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

      useIntentStore.getState().setScenario("traffic");

      const f = useIntentStore.getState().form;
      expect(f.scenario).toBe("traffic");
      expect(f.textInput).toBeUndefined();
      expect(f.fileData).toBeUndefined();
      expect(f.audioData).toBeUndefined();
      expect(revoke).toHaveBeenCalledWith("blob:http://localhost/1");
      expect(revoke).toHaveBeenCalledWith("blob:http://localhost/2");

      revoke.mockRestore();
    });
  });

  describe("setTextInput", () => {
    it("updates text input in form state", () => {
      useIntentStore.getState().setTextInput("Patient has fever");
      expect(useIntentStore.getState().form.textInput).toBe(
        "Patient has fever",
      );
    });

    it("handles empty string", () => {
      useIntentStore.getState().setTextInput("");
      expect(useIntentStore.getState().form.textInput).toBe("");
    });
  });

  describe("submitIntent", () => {
    it("sets error when no input is provided", async () => {
      await useIntentStore.getState().submitIntent();
      expect(useIntentStore.getState().error).toBe(
        "Please provide at least one input before submitting.",
      );
    });

    it("clears error and output on new submission", async () => {
      useIntentStore.setState({
        error: "old error",
        outputData: { old: true },
      });
      useIntentStore.getState().setTextInput("test input");

      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ success: true, data: { result: "ok" } }),
      };
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

      await useIntentStore.getState().submitIntent();
      expect(useIntentStore.getState().error).toBeNull();
    });

    it("sets output data on successful response", async () => {
      useIntentStore.getState().setTextInput("test input");

      const mockData = { triageLevel: "URGENT", confidenceScore: 0.9 };
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockData }),
      };
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

      await useIntentStore.getState().submitIntent();
      expect(useIntentStore.getState().outputData).toEqual(mockData);
      expect(useIntentStore.getState().currentStage).toBe("ACT");
    });

    it("sets error on failed response", async () => {
      useIntentStore.getState().setTextInput("test input");

      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({ success: false, error: "Model failed" }),
      };
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

      await useIntentStore.getState().submitIntent();
      expect(useIntentStore.getState().error).toBe("Model failed");
      expect(useIntentStore.getState().currentStage).toBe("IDLE");
    });

    it("sets error on network failure", async () => {
      useIntentStore.getState().setTextInput("test input");
      vi.stubGlobal(
        "fetch",
        vi.fn().mockRejectedValue(new Error("Network error")),
      );

      await useIntentStore.getState().submitIntent();
      expect(useIntentStore.getState().error).toBe("Network error");
      expect(useIntentStore.getState().currentStage).toBe("IDLE");
    });

    it("sends correct payload shape", async () => {
      useIntentStore.getState().setScenario("disaster");
      useIntentStore.getState().setTextInput("Patient info");

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });
      vi.stubGlobal("fetch", fetchMock);

      await useIntentStore.getState().submitIntent();

      expect(fetchMock).toHaveBeenCalledWith("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.any(String),
        signal: expect.any(AbortSignal),
      });

      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.scenario).toBe("disaster");
      expect(body.textInput).toBe("Patient info");
    });
  });

  describe("reset", () => {
    it("clears output data and error", () => {
      useIntentStore.setState({
        outputData: { test: true },
        error: "some error",
        currentStage: "ACT",
      });
      useIntentStore.getState().reset();
      expect(useIntentStore.getState().outputData).toBeNull();
      expect(useIntentStore.getState().error).toBeNull();
      expect(useIntentStore.getState().currentStage).toBe("IDLE");
    });

    it("preserves the current scenario", () => {
      useIntentStore.getState().setScenario("traffic");
      useIntentStore.getState().reset();
      expect(useIntentStore.getState().form.scenario).toBe("traffic");
    });
  });
});
