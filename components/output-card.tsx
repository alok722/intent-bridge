"use client";

import { useState } from "react";
import { useIntentStore } from "@/store/intent-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShieldAlert, CheckCircle, Zap } from "lucide-react";

export default function OutputCard() {
  const { outputData, currentStage, reset } = useIntentStore();
  const [dispatched, setDispatched] = useState(false);

  if (currentStage !== "ACT" || !outputData) return null;

  const getSeverityMeta = (val: string | number) => {
    const v = String(val).toUpperCase();
    if (v.includes("CRITICAL") || v.includes("IMMEDIATE") || Number(v) > 7) {
      return {
        color: "bg-red-500 hover:bg-red-600",
        icon: ShieldAlert,
        label: "CRITICAL",
      };
    }
    if (v.includes("HIGH") || v.includes("URGENT") || Number(v) > 4) {
      return {
        color: "bg-orange-500 hover:bg-orange-600",
        icon: ShieldAlert,
        label: "HIGH RISK",
      };
    }
    return {
      color: "bg-yellow-500 hover:bg-yellow-600 text-black",
      icon: CheckCircle,
      label: "MODERATE",
    };
  };

  const out = outputData as Record<string, string | number | string[]>;
  const severityVal =
    out.triageLevel ||
    out.severityLevel ||
    out.severityScore ||
    out.urgency ||
    out.severity ||
    "UNKNOWN";
  const meta = getSeverityMeta(severityVal as string);
  const Icon = meta.icon;
  const conf = Math.round(((out.confidenceScore as number) || 0) * 100);

  return (
    <Card className="bg-zinc-950 border-red-500/30 overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-6">
      <CardHeader className="border-b border-zinc-900 bg-red-950/10 flex flex-row items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <Icon
            className={cn(
              "w-6 h-6",
              meta.color.replace("bg-", "text-").split(" ")[0],
            )}
          />
          <CardTitle className="text-xl tracking-tight text-white font-bold">
            Verified Intelligence
          </CardTitle>
        </div>
        <Badge className={cn("px-3 py-1 font-bold text-sm", meta.color)}>
          {String(severityVal).toUpperCase()}
        </Badge>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="inline-flex flex-col gap-1 w-full">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Confidence Score
          </span>
          <div className="flex items-center gap-3">
            <Progress
              value={conf}
              className="h-2 flex-1 [&>div]:bg-red-500"
              aria-label={`Confidence: ${conf}%`}
            />
            <span className="text-sm font-bold text-zinc-300">{conf}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
          {Object.entries(outputData).map(([key, val]) => {
            if (key === "confidenceScore" || key.toLowerCase().includes("score"))
              return null;

            const isArray = Array.isArray(val);
            return (
              <div key={key} className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                {isArray ? (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(val as string[]).map((tag, i) => (
                      <Badge
                        variant="outline"
                        key={i}
                        className="bg-zinc-950 text-zinc-300 border-zinc-700"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-zinc-200 font-medium">
                    {typeof val === "object" ? JSON.stringify(val) : String(val)}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {dispatched ? (
          <div
            role="status"
            className="rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-4 text-center"
          >
            <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-400">
              Execution signal dispatched to field unit.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-4 pt-4">
            <Button
              aria-label="Dispatch execution signal to field unit"
              className="w-full py-6 text-lg font-bold bg-white text-black hover:bg-zinc-200"
              onClick={() => setDispatched(true)}
            >
              <Zap className="mr-2 w-5 h-5" /> Dispatch / Execute
            </Button>
            <Button
              aria-label="Dismiss output and reset"
              variant="outline"
              className="py-6 border-zinc-700 text-white hover:bg-zinc-800"
              onClick={reset}
            >
              Dismiss
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
