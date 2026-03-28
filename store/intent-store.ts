import { create } from "zustand";
import { toBase64 } from "@/lib/utils";

export type PipelineStage =
  | "IDLE"
  | "INGEST"
  | "PARSE"
  | "STRUCTURE"
  | "VERIFY"
  | "ACT";
export type ScenarioDomain =
  | "medical"
  | "disaster"
  | "infrastructure"
  | "epidemiology"
  | "traffic";

interface FormState {
  scenario: ScenarioDomain;
  textInput?: string;
  fileData?: { mimeType: string; base64: string; previewUrl: string };
  audioData?: { mimeType: string; base64: string; audioUrl: string };
}

function revokeFormAssets(form: FormState) {
  if (form.fileData?.previewUrl) URL.revokeObjectURL(form.fileData.previewUrl);
  if (form.audioData?.audioUrl) URL.revokeObjectURL(form.audioData.audioUrl);
}

interface IntentStore {
  form: FormState;
  currentStage: PipelineStage;
  outputData: Record<string, unknown> | null;
  error: string | null;
  setScenario: (scenario: ScenarioDomain) => void;
  setTextInput: (text: string) => void;
  setFileData: (file: File | null) => Promise<void>;
  setAudioData: (blob: Blob | null) => Promise<void>;
  setStage: (stage: PipelineStage) => void;
  submitIntent: () => Promise<void>;
  reset: () => void;
}

let stageTimers: ReturnType<typeof setTimeout>[] = [];
let abortController: AbortController | null = null;

function clearStageTimers() {
  stageTimers.forEach(clearTimeout);
  stageTimers = [];
}

function abortInflight() {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
}

export const useIntentStore = create<IntentStore>((set, get) => ({
  form: { scenario: "medical" },
  currentStage: "IDLE",
  outputData: null,
  error: null,

  setScenario: (scenario) => {
    clearStageTimers();
    abortInflight();
    set((state) => {
      const form: FormState = { ...state.form, scenario };
      delete form.textInput;
      return {
        form,
        outputData: null,
        error: null,
        currentStage: "IDLE",
      };
    });
  },

  setTextInput: (text) =>
    set((state) => ({ form: { ...state.form, textInput: text } })),

  setFileData: async (file) => {
    const prev = get().form.fileData?.previewUrl;
    if (prev) URL.revokeObjectURL(prev);

    if (!file) {
      set((state) => ({ form: { ...state.form, fileData: undefined } }));
      return;
    }
    const base64 = await toBase64(file);
    const previewUrl = URL.createObjectURL(file);
    set((state) => ({
      form: {
        ...state.form,
        fileData: { mimeType: file.type, base64, previewUrl },
      },
    }));
  },

  setAudioData: async (blob) => {
    const prev = get().form.audioData?.audioUrl;
    if (prev) URL.revokeObjectURL(prev);

    if (!blob) {
      set((state) => ({ form: { ...state.form, audioData: undefined } }));
      return;
    }
    const base64 = await toBase64(blob);
    const audioUrl = URL.createObjectURL(blob);
    set((state) => ({
      form: {
        ...state.form,
        audioData: { mimeType: blob.type, base64, audioUrl },
      },
    }));
  },

  setStage: (stage) => set({ currentStage: stage }),

  submitIntent: async () => {
    const { form } = get();
    if (!form.textInput && !form.fileData && !form.audioData) {
      set({ error: "Please provide at least one input before submitting." });
      return;
    }

    clearStageTimers();
    abortInflight();

    abortController = new AbortController();
    const { signal } = abortController;

    set({ currentStage: "INGEST", error: null, outputData: null });

    stageTimers.push(
      setTimeout(() => {
        if (!signal.aborted) set({ currentStage: "PARSE" });
      }, 600),
    );
    stageTimers.push(
      setTimeout(() => {
        if (!signal.aborted) set({ currentStage: "STRUCTURE" });
      }, 1200),
    );
    stageTimers.push(
      setTimeout(() => {
        if (!signal.aborted) set({ currentStage: "VERIFY" });
      }, 2000),
    );

    try {
      const payload = {
        scenario: form.scenario,
        textInput: form.textInput,
        fileData: form.fileData
          ? { mimeType: form.fileData.mimeType, base64: form.fileData.base64 }
          : undefined,
        audioData: form.audioData
          ? {
              mimeType: form.audioData.mimeType,
              base64: form.audioData.base64,
            }
          : undefined,
      };

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Failed to process request",
        );
      }

      clearStageTimers();
      set({ outputData: data.data, currentStage: "ACT" });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      clearStageTimers();
      set({ error: errorMessage, currentStage: "IDLE" });
    }
  },

  reset: () => {
    clearStageTimers();
    abortInflight();
    const { form } = get();
    revokeFormAssets(form);
    set({
      form: { scenario: form.scenario },
      currentStage: "IDLE",
      outputData: null,
      error: null,
    });
  },
}));
