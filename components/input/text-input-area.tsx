"use client";

import { useIntentStore } from "@/store/intent-store";
import { Textarea } from "@/components/ui/textarea";

export function TextInputArea() {
  const { form, setTextInput } = useIntentStore();

  return (
    <div>
      <label
        htmlFor="intent-text-input"
        className="text-sm font-medium text-zinc-600 mb-2 block tracking-tight"
      >
        Free-text Description
      </label>
      <Textarea
        id="intent-text-input"
        className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-red-500 min-h-[120px] resize-none"
        placeholder="Paste unstructured notes, news article content, or messy diagnostic text here..."
        value={form.textInput || ""}
        onChange={(e) => setTextInput(e.target.value)}
      />
    </div>
  );
}
