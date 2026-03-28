"use client";

import { useState } from "react";
import { useIntentStore } from "@/store/intent-store";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap } from "lucide-react";

export function ActionButtons() {
  const { reset } = useIntentStore();
  const [dispatched, setDispatched] = useState(false);

  return (
    <div className="p-6">
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
        <div className="flex items-center gap-4">
          <Button
            aria-label="Dispatch execution signal to field unit"
            className="w-full py-6 text-lg font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-all active:scale-[0.98]"
            onClick={() => setDispatched(true)}
          >
            <Zap className="mr-2 w-5 h-5" /> Dispatch / Execute
          </Button>
          <Button
            aria-label="Dismiss output and reset"
            variant="outline"
            className="py-6 border-zinc-300 text-zinc-800 hover:bg-zinc-100 transition-all active:scale-[0.98]"
            onClick={reset}
          >
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );
}
