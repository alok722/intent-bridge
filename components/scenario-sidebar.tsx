"use client";

import { useIntentStore, ScenarioDomain } from "@/store/intent-store";
import { cn } from "@/lib/utils";
import { HeartPulse, HardHat, Car, ShieldAlert, Activity, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const SCENARIOS: { id: ScenarioDomain; label: string; icon: LucideIcon; color: string }[] = [
  { id: 'medical', label: 'E-Medical Triage', icon: HeartPulse, color: 'text-rose-500' },
  { id: 'disaster', label: 'Disaster Coordination', icon: ShieldAlert, color: 'text-orange-500' },
  { id: 'infrastructure', label: 'Infra Management', icon: HardHat, color: 'text-yellow-500' },
  { id: 'epidemiology', label: 'Bio / Epidemiology', icon: Activity, color: 'text-green-500' },
  { id: 'traffic', label: 'Traffic Rerouting', icon: Car, color: 'text-blue-500' },
];

export default function ScenarioSidebar() {
  const { form, setScenario } = useIntentStore();

  return (
    <aside className="w-full md:w-64 bg-white border-b md:border-r border-zinc-200 p-4 shrink-0 flex flex-col h-full overflow-y-auto shadow-sm md:shadow-none">
      <div className="flex items-center gap-2 px-2 py-4 mb-4 border-b border-zinc-200">
        <div className="w-4 h-4 rounded-full bg-red-600 animate-pulse" />
        <h1 className="font-bold text-lg tracking-tight text-zinc-900">IntentBridge Core</h1>
      </div>
      
      <div className="space-y-1">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-2 mb-3">Operating Domain</h2>
        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {SCENARIOS.map((s) => {
            const isActive = form.scenario === s.id;
            const Icon = s.icon;
            return (
              <Button
                key={s.id}
                variant="ghost"
                onClick={() => setScenario(s.id)}
                className={cn(
                  "justify-start text-sm tracking-tight transition-all py-6 md:py-4 shrink-0 px-4 md:px-3 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                  isActive 
                    ? "bg-red-50 text-zinc-900 font-medium shadow-sm border border-red-200" 
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border border-transparent"
                )}
              >
                <Icon className={cn("w-5 h-5 mr-3 hidden sm:block", isActive ? s.color : "text-zinc-400")} />
                {s.label}
              </Button>
            );
          })}
        </div>
      </div>
      
      <div className="mt-auto hidden md:block px-2">
        <p className="text-xs text-zinc-500 leading-tight">
          System: IntentBridge v1.0 <br />
          Latency: Responsive <br />
          Model: Gemini AI
        </p>
      </div>
    </aside>
  );
}
