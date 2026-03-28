"use client";

import { useIntentStore } from "@/store/intent-store";
import { Card } from "@/components/ui/card";
import { SeverityBadge, ConfidenceScore, DataDisplay, ActionButtons } from "./output";

export default function OutputCard() {
  const { outputData, currentStage } = useIntentStore();

  if (currentStage !== "ACT" || !outputData) return null;

  const out = outputData as Record<string, unknown>;
  const severityVal =
    out.triageLevel ||
    out.severityLevel ||
    out.severityScore ||
    out.urgency ||
    out.severity ||
    "UNKNOWN";

  return (
    <Card className="bg-white border-red-200/70 overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-6">
      <SeverityBadge value={severityVal as string | number} />

      <div className="flex flex-col">
        <ConfidenceScore score={out.confidenceScore as number} />
        <DataDisplay data={out} />
        <ActionButtons />
      </div>
    </Card>
  );
}
