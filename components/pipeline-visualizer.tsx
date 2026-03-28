"use client";

import { useIntentStore, type PipelineStage } from "@/store/intent-store";
import { cn } from "@/lib/utils";
import { CheckCircle2, CircleDashed, Loader2 } from "lucide-react";

const STAGES: { id: PipelineStage; label: string }[] = [
  { id: "INGEST", label: "Ingest" },
  { id: "PARSE", label: "Parse" },
  { id: "STRUCTURE", label: "Structure" },
  { id: "VERIFY", label: "Verify" },
  { id: "ACT", label: "Act" },
];

export default function PipelineVisualizer() {
  const { currentStage } = useIntentStore();

  const currentIndex = STAGES.findIndex((s) => s.id === currentStage);

  if (currentStage === "IDLE") return null;

  const activeLabel =
    STAGES.find((s) => s.id === currentStage)?.label ?? "Processing";

  return (
    <div
      className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 shadow-inner my-6"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="sr-only">Pipeline stage: {activeLabel}</span>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {STAGES.map((stage, idx) => {
          const isActive = idx === currentIndex;
          const isPast = currentIndex > -1 && idx < currentIndex;

          return (
            <div
              key={stage.id}
              className="flex items-center gap-3 md:gap-4 flex-1 w-full relative"
            >
              <div
                className={cn(
                  "flex items-center justify-center p-3 rounded-full transition-all duration-300 ring-2 ring-offset-2 ring-offset-zinc-950",
                  isActive
                    ? "bg-red-600/20 text-red-500 ring-red-500/50"
                    : isPast
                      ? "bg-zinc-800 text-zinc-300 ring-zinc-800"
                      : "bg-zinc-900 text-zinc-600 ring-transparent",
                )}
              >
                {isActive ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isPast ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <CircleDashed className="w-5 h-5" />
                )}
              </div>
              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-sm font-bold tracking-tight uppercase transition-colors",
                    isActive
                      ? "text-red-400 font-bold"
                      : isPast
                        ? "text-zinc-300"
                        : "text-zinc-600",
                  )}
                >
                  {stage.label}
                </span>
              </div>
              {idx < STAGES.length - 1 && (
                <div className="hidden md:block flex-1 mx-4 border-t-2 border-dashed border-zinc-800" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
