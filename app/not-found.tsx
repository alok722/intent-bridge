import Link from "next/link";
import { ShieldOff } from "lucide-react";

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black p-6 sm:p-8">
      <div className="flex w-full max-w-md flex-col items-center text-center space-y-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-zinc-900">
          <ShieldOff className="h-8 w-8 text-zinc-500" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tighter text-white">
            404
          </h1>
          <p className="text-sm text-zinc-400">
            This route does not exist in the IntentBridge system.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex rounded-lg border border-zinc-800 bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
