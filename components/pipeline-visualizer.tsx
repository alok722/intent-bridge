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
      className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 shadow-sm my-6 w-full min-w-0 max-w-full overflow-x-hidden"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="sr-only">Pipeline stage: {activeLabel}</span>
      {/* Stack on small / tablet; horizontal only when viewport fits five steps */}
      <div className="flex flex-col xl:flex-row xl:flex-nowrap xl:items-center xl:justify-between gap-3 xl:gap-0 w-full min-w-0">
        {STAGES.map((stage, idx) => {
          const isActive = idx === currentIndex;
          const isPast = currentIndex > -1 && idx < currentIndex;

          return (
            <div
              key={stage.id}
              className="flex items-center w-full min-w-0 xl:flex-1 xl:min-w-0"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0 xl:flex-initial xl:shrink-0">
                <div
                  className={cn(
                    "shrink-0 flex items-center justify-center p-2.5 sm:p-3 rounded-full transition-all duration-300 ring-2 ring-offset-2 ring-offset-white",
                    isActive
                      ? "bg-red-100 text-red-600 ring-red-400/60"
                      : isPast
                        ? "bg-zinc-200 text-zinc-700 ring-zinc-300"
                        : "bg-zinc-100 text-zinc-500 ring-transparent",
                  )}
                >
                  {isActive ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : isPast ? (
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <CircleDashed className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>
                <span
                  title={stage.label}
                  className={cn(
                    "text-xs sm:text-sm font-bold tracking-tight uppercase transition-colors flex-1 min-w-0 truncate xl:flex-none xl:max-w-[4.75rem] 2xl:max-w-[6rem]",
                    isActive
                      ? "text-red-600 font-bold"
                      : isPast
                        ? "text-zinc-700"
                        : "text-zinc-500",
                  )}
                >
                  {stage.label}
                </span>
              </div>
              {idx < STAGES.length - 1 && (
                <div
                  className="hidden xl:block flex-1 min-w-[0.25rem] mx-1 2xl:mx-2 border-t-2 border-dashed border-zinc-300 self-center shrink"
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
