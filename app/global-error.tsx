"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-100 flex items-center justify-center p-8 font-sans antialiased text-zinc-900">
        <div className="max-w-md w-full bg-white border border-zinc-200 rounded-xl p-8 text-center space-y-6 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
              Critical Error
            </h2>
            <p className="text-sm text-zinc-600">
              A critical application error occurred. Please refresh or try
              again.
            </p>
          </div>
          <button
            onClick={reset}
            className="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
