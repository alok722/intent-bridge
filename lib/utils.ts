import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges Tailwind class lists, resolving conflicts via `tailwind-merge`. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Converts a Blob/File to a raw base64 string (no data-URI prefix).
 *
 * @param file - The Blob or File to encode
 * @returns The base64-encoded content string
 * @throws {Error} If the FileReader fails or produces an empty result
 */
export function toBase64(file: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("FileReader produced a non-string result"));
        return;
      }
      const commaIndex = result.indexOf(",");
      if (commaIndex === -1) {
        reject(new Error("FileReader result missing data-URI comma separator"));
        return;
      }
      resolve(result.slice(commaIndex + 1));
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("FileReader encountered an unknown error"));
  });
}

/**
 * Formats a `camelCase` or `PascalCase` key into a human-readable label.
 *
 * @example formatFieldLabel("chiefComplaint") → "chief Complaint"
 */
export function formatFieldLabel(key: string): string {
  return key.replace(/([A-Z])/g, " $1").trim();
}
