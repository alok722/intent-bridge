"use client";

import { Progress } from "@/components/ui/progress";

interface ConfidenceScoreProps {
  score: number;
}

export function ConfidenceScore({ score }: ConfidenceScoreProps) {
  const conf = Math.round((score || 0) * 100);

  return (
    <div className="inline-flex flex-col gap-1 w-full p-6">
      <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
        Confidence Score
      </span>
      <div className="flex items-center gap-3">
        <Progress
          value={conf}
          className="h-2 flex-1 [&>div]:bg-red-500"
          aria-label={`Confidence: ${conf}%`}
        />
        <span className="text-sm font-bold text-zinc-700">{conf}%</span>
      </div>
    </div>
  );
}
