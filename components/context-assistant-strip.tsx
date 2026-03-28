"use client";

import { useIntentStore, type ScenarioDomain } from "@/store/intent-store";
import { getScenarioAssistantContext } from "@/lib/scenario-context";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const DOMAIN_LABEL: Record<ScenarioDomain, string> = {
  medical: "E-Medical Triage",
  disaster: "Disaster Coordination",
  infrastructure: "Infrastructure",
  epidemiology: "Epidemiology",
  traffic: "Traffic Operations",
};

export default function ContextAssistantStrip() {
  const scenario = useIntentStore((s) => s.form.scenario);
  const ctx = getScenarioAssistantContext(scenario);

  return (
    <section
      aria-label="Context-aware assistant"
      className="mb-6 rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-4 py-4 md:px-5 md:py-5 backdrop-blur-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
          <Sparkles className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Dynamic assistant · {DOMAIN_LABEL[scenario]}
          </p>
          <p className="text-sm font-medium text-zinc-200">{ctx.focus}</p>
          <p className="text-xs leading-relaxed text-zinc-400">{ctx.reasoning}</p>
          <ul className="flex flex-wrap gap-2 pt-1">
            {ctx.expectedOutputs.map((line) => (
              <li
                key={line}
                className={cn(
                  "rounded-md border border-zinc-700/80 bg-zinc-950/60 px-2.5 py-1 text-[11px] font-medium text-zinc-300",
                )}
              >
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
