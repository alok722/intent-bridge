"use client";

import { useIntentStore } from "@/store/intent-store";
import { UploadCloud, Mic, TextCursorInput } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

export default function InputPanel() {
  const {
    form,
    setTextInput,
    setFileData,
    setAudioData,
    submitIntent,
    currentStage,
    error,
  } = useIntentStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFileData(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileData(e.target.files[0]);
    }
  };

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        setAudioData(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(
        () => setRecordingTime((t) => t + 1),
        1000,
      );
    } catch (err) {
      console.error("Mic access denied", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

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
        {/* Text Input */}
        <div>
          <label
            htmlFor="intent-text-input"
            className="text-sm font-medium text-zinc-600 mb-2 block tracking-tight"
          >
            Free-text Description
          </label>
          <Textarea
            id="intent-text-input"
            className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-red-500 min-h-[120px] resize-none"
            placeholder="Paste unstructured notes, news article content, or messy diagnostic text here..."
            value={form.textInput || ""}
            onChange={(e) => setTextInput(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File Upload: outer div handles drag/drop; empty state uses native button for a11y */}
          <div
            className={cn(
              "border-2 border-dashed border-zinc-200 rounded-lg relative transition",
              form.fileData && "border-red-400/60 bg-red-50/80",
            )}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              tabIndex={-1}
            />
            {form.fileData ? (
              <div className="space-y-2 w-full text-left p-6">
                <p className="text-zinc-800 font-medium truncate text-sm">
                  File Ready ({form.fileData.mimeType})
                </p>
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full mt-2"
                  type="button"
                  onClick={() => {
                    setFileData(null);
                  }}
                >
                  Remove File
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openFilePicker}
                aria-label="Upload image or PDF. Drag and drop a file here, or press to open file picker."
                className={cn(
                  "flex w-full min-h-[148px] flex-col items-center justify-center rounded-lg p-6 text-center",
                  "cursor-pointer border-0 bg-transparent text-inherit",
                  "hover:bg-zinc-50 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                )}
              >
                <UploadCloud className="w-8 h-8 text-zinc-400 mb-2 pointer-events-none" aria-hidden />
                <span className="text-sm text-zinc-600 font-medium pointer-events-none">
                  Drag & Drop Image/PDF
                </span>
                <span className="text-xs text-zinc-500 mt-1 pointer-events-none">
                  or click to browse files
                </span>
              </button>
            )}
          </div>

          {/* Voice Input */}
          <div
            className={cn(
              "border-2 border-dashed border-zinc-200 rounded-lg p-6 flex flex-col items-center justify-center transition relative",
              form.audioData && "border-red-400/60 bg-red-50/80",
            )}
          >
            {form.audioData ? (
              <div className="space-y-2 w-full text-center relative z-10 p-2">
                <p className="text-zinc-800 font-medium text-sm">
                  Audio Recorded
                </p>
                <audio
                  controls
                  src={form.audioData.audioUrl}
                  className="w-full h-8 max-w-[200px] mb-2 mx-auto"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full mt-2"
                  onClick={() => setAudioData(null)}
                >
                  Discard Rec
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  aria-label={
                    isRecording ? "Stop recording" : "Start voice recording"
                  }
                  className={cn(
                    "p-4 rounded-full transition-all flex items-center justify-center mx-auto focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                    isRecording
                      ? "bg-red-600 animate-pulse ring-4 ring-red-500/30"
                      : "bg-zinc-200 hover:bg-zinc-300",
                  )}
                >
                  <Mic
                    className={cn(
                      "w-6 h-6",
                      isRecording ? "text-white" : "text-zinc-600",
                    )}
                  />
                </button>
                {isRecording ? (
                  <p className="text-red-600 text-sm font-medium animate-pulse">
                    Recording... {recordingTime}s
                  </p>
                ) : (
                  <p className="text-sm text-zinc-600 font-medium">
                    Capture Voice Note
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error display */}
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
