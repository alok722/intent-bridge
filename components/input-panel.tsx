"use client";

import { useIntentStore } from "@/store/intent-store";
import { TextCursorInput } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VoiceRecorder, FileDropzone, TextInputArea } from "./input";

export default function InputPanel() {
  const { form, submitIntent, currentStage, error } = useIntentStore();

  const hasInput = !!(form.textInput || form.fileData || form.audioData);

  return (
    <Card className="bg-white border-zinc-200 text-zinc-900 shadow-sm flex flex-col gap-4">
      <CardHeader>
        <CardTitle className="tracking-tight text-xl font-bold flex items-center gap-2">
          <TextCursorInput className="w-5 h-5 text-red-600" /> Multi-modal
          Intake
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <TextInputArea />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileDropzone />
          <VoiceRecorder />
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="pt-4">
          <Button
            className="w-full py-6 text-lg font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:bg-zinc-300"
            disabled={!hasInput || currentStage !== "IDLE"}
            onClick={() => submitIntent()}
          >
            {currentStage !== "IDLE"
              ? "Processing Inference..."
              : "Process Intelligence"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
