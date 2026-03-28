"use client";

import { useIntentStore } from "@/store/intent-store";
import { Radar } from "lucide-react";

export default function EmptyState() {
  const { currentStage, outputData } = useIntentStore();

  if (currentStage !== "IDLE" || outputData) return null;

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 opacity-60">
      <Radar className="w-10 h-10 text-zinc-600 mb-4" />
      <p className="text-sm text-zinc-500 font-medium max-w-sm">
        Submit data above to see structured intelligence here. Results will
        include severity assessment, confidence scoring, and actionable dispatch
        commands.
      </p>
    </div>
  );
}
