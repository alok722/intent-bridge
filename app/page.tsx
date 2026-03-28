import dynamic from "next/dynamic";
import ScenarioSidebar from "@/components/scenario-sidebar";
import ContextAssistantStrip from "@/components/context-assistant-strip";
import InputPanel from "@/components/input-panel";
import { ErrorBoundary } from "@/components/error-boundary";
import EmptyState from "@/components/empty-state";

const PipelineVisualizer = dynamic(
  () => import("@/components/pipeline-visualizer"),
);

const OutputCard = dynamic(() => import("@/components/output-card"));

export default function DashboardPage() {
  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-zinc-100 overflow-hidden relative selection:bg-red-200/80">
      <div className="absolute inset-0 pointer-events-none bg-[url('/grid.svg')] bg-center opacity-[0.06] [mask-image:linear-gradient(180deg,rgba(24,24,27,0.12),rgba(255,255,255,0))]" />

      <ScenarioSidebar />

      <main className="flex-1 w-full min-w-0 bg-zinc-50/95 flex flex-col h-[100dvh] overflow-y-auto z-10 p-4 md:p-8">
        <header className="mb-6 md:mb-10 px-1 flex flex-col gap-2">
          <h1 className="text-3xl md:text-5xl font-bold font-heading tracking-tighter text-zinc-900">
            Intelligence Console
          </h1>
          <p className="text-zinc-600 text-sm md:text-base font-medium max-w-2xl">
            Connect disparate field data into actionable operations. Drop an
            image, dictate a note, or paste raw telemetry below to begin
            processing.
          </p>
        </header>

        <div className="flex-1 flex flex-col gap-4 max-w-5xl w-full min-w-0 mx-auto pb-24">
          <ContextAssistantStrip />
          <ErrorBoundary fallbackLabel="Input panel encountered an error.">
            <InputPanel />
          </ErrorBoundary>

          <ErrorBoundary fallbackLabel="Pipeline visualization error.">
            <PipelineVisualizer />
          </ErrorBoundary>

          <ErrorBoundary fallbackLabel="Output display error.">
            <OutputCard />
          </ErrorBoundary>

          <EmptyState />
        </div>
      </main>
    </div>
  );
}
