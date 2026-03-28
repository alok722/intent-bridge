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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black flex items-center justify-center p-8 font-sans antialiased text-zinc-300">
        <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-xl p-8 text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Critical Error
            </h2>
            <p className="text-sm text-zinc-400">
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
