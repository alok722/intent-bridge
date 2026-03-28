"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ShieldAlert, CheckCircle, LucideIcon } from "lucide-react";

interface SeverityBadgeProps {
  value: string | number;
}

export function SeverityBadge({ value }: SeverityBadgeProps) {
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

  const meta = getSeverityMeta(value);
  const Icon: LucideIcon = meta.icon;

  return (
    <div className="flex items-center justify-between py-4 px-6 border-b border-zinc-200 bg-red-50/70">
      <div className="flex items-center gap-3">
        <Icon
          className={cn(
            "w-6 h-6",
            meta.color.replace("bg-", "text-").split(" ")[0]
          )}
        />
        <h3 className="text-xl tracking-tight text-zinc-900 font-bold">
          Verified Intelligence
        </h3>
      </div>
      <Badge className={cn("px-3 py-1 font-bold text-sm", meta.color)}>
        {String(value).toUpperCase()}
      </Badge>
    </div>
  );
}
