"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-xl p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Something went wrong
          </h2>
          <p className="text-sm text-zinc-400">
            An unexpected error occurred while processing your request.
          </p>
        </div>
        <Button
          onClick={reset}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
