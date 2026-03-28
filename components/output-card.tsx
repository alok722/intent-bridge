"use client";

import { useState } from "react";
import { useIntentStore } from "@/store/intent-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShieldAlert, CheckCircle, Zap } from "lucide-react";

function formatArrayListItem(item: unknown): string {
  if (item === null || item === undefined) return "";
  if (typeof item !== "object") return String(item);
  if (Array.isArray(item)) return JSON.stringify(item);
  return Object.entries(item as Record<string, unknown>)
    .map(([k, v]) => {
      const inner =
        v !== null && typeof v === "object" ? JSON.stringify(v) : String(v ?? "");
      return `${k}: ${inner}`;
    })
    .join(" · ");
}

export default function OutputCard() {
  const { outputData, currentStage, reset } = useIntentStore();
  const [dispatched, setDispatched] = useState(false);

  if (currentStage !== "ACT" || !outputData) return null;

  const getSeverityMeta = (val: string | number) => {
    const v = String(val).toUpperCase();
    if (v.includes("CRITICAL") || v.includes("IMMEDIATE") || Number(v) > 7) {
      return {
        color: "bg-red-600 hover:bg-red-700 text-white border-transparent",
        icon: ShieldAlert,
        label: "CRITICAL",
      };
    }
    if (v.includes("HIGH") || v.includes("URGENT") || Number(v) > 4) {
      return {
        color: "bg-orange-600 hover:bg-orange-700 text-white border-transparent",
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
    <Card className="bg-white border-red-200/70 overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-6">
      <CardHeader className="border-b border-zinc-200 bg-red-50/70 flex flex-row items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <Icon
            className={cn(
              "w-6 h-6",
              meta.color.replace("bg-", "text-").split(" ")[0],
            )}
          />
          <CardTitle className="text-xl tracking-tight text-zinc-900 font-bold">
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
            <span className="text-sm font-bold text-zinc-700">{conf}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg bg-zinc-50 border border-zinc-200">
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
                  <ul className="mt-1 flex list-none flex-col gap-2 p-0">
                    {(val as unknown[]).map((item, i) => (
                      <li
                        key={i}
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium leading-relaxed text-zinc-800 break-words [overflow-wrap:anywhere]"
                      >
                        {formatArrayListItem(item)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-sm text-zinc-800 font-medium">
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
            className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-4 text-center"
          >
            <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-emerald-800">
              Execution signal dispatched to field unit.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-4 pt-4">
            <Button
              aria-label="Dispatch execution signal to field unit"
              className="w-full py-6 text-lg font-bold bg-zinc-900 text-white hover:bg-zinc-800"
              onClick={() => setDispatched(true)}
            >
              <Zap className="mr-2 w-5 h-5" /> Dispatch / Execute
            </Button>
            <Button
              aria-label="Dismiss output and reset"
              variant="outline"
              className="py-6 border-zinc-300 text-zinc-800 hover:bg-zinc-100"
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
