import Link from "next/link";
import { ShieldOff } from "lucide-react";

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-100 p-6 sm:p-8">
      <div className="flex w-full max-w-md flex-col items-center text-center space-y-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-zinc-200">
          <ShieldOff className="h-8 w-8 text-zinc-600" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tighter text-zinc-900">
            404
          </h1>
          <p className="text-sm text-zinc-600">
            This route does not exist in the IntentBridge system.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-100"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
