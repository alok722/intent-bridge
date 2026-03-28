"use client";

import { useIntentStore } from "@/store/intent-store";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

/**
 * Microphone recorder with live duration display.
 * Properly cleans up MediaStream tracks and interval timers on unmount.
 */
export function VoiceRecorder() {
  const { form, setAudioData } = useIntentStore();
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount: stop recording, release mic, clear timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        setAudioData(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
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
  }, [setAudioData]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  return (
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
              "p-4 rounded-full transition-all flex items-center justify-center mx-auto focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white cursor-pointer",
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
  );
}
