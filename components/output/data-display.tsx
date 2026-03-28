"use client";

import { useMemo } from "react";
import { formatFieldLabel } from "@/lib/utils";

/** Formats a single array item that may be a primitive, array, or object. */
function formatArrayListItem(item: unknown): string {
  if (item === null || item === undefined) return "";
  if (typeof item !== "object") return String(item);
  if (Array.isArray(item)) return JSON.stringify(item);
  return Object.entries(item as Record<string, unknown>)
    .map(([k, v]) => {
      const inner =
        v !== null && typeof v === "object" ? JSON.stringify(v) : String(v ?? "");
      return `${k}: ${inner}`;
    })
    .join(" · ");
}

interface DataDisplayProps {
  /** The structured output data to render as a field grid. */
  data: Record<string, unknown>;
}

/**
 * Renders structured output data in a responsive grid layout.
 * Score fields are excluded (rendered separately by ConfidenceScore).
 */
export function DataDisplay({ data }: DataDisplayProps) {
  const entries = useMemo(
    () =>
      Object.entries(data).filter(
        ([key]) =>
          key !== "confidenceScore" && !key.toLowerCase().includes("score"),
      ),
    [data],
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 mx-6 rounded-lg bg-zinc-50 border border-zinc-200">
      {entries.map(([key, val]) => {
        const isArray = Array.isArray(val);
        return (
          <div key={key} className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              {formatFieldLabel(key)}
            </span>
            {isArray ? (
              <ul className="mt-1 flex list-none flex-col gap-2 p-0">
                {val.map((item, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium leading-relaxed text-zinc-800 break-words [overflow-wrap:anywhere]"
                  >
                    {formatArrayListItem(item)}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-sm text-zinc-800 font-medium">
                {typeof val === "object" ? JSON.stringify(val) : String(val)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
