"use client";

import { useIntentStore } from "@/store/intent-store";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

export function FileDropzone() {
  const { form, setFileData } = useIntentStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFileData(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileData(e.target.files[0]);
    }
  };

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div
      className={cn(
        "border-2 border-dashed border-zinc-200 rounded-lg relative transition overflow-hidden min-h-[148px]",
        form.fileData && "border-red-400/60 bg-red-50/80",
      )}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        onChange={handleFileChange}
        accept="image/*,application/pdf"
        tabIndex={-1}
      />
      {form.fileData ? (
        <div className="space-y-2 w-full text-left p-6">
          <p className="text-zinc-800 font-medium truncate text-sm">
            File Ready ({form.fileData.mimeType})
          </p>
          <Button
            size="sm"
            variant="destructive"
            className="w-full mt-2"
            type="button"
            onClick={() => setFileData(null)}
          >
            Remove File
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={openFilePicker}
          aria-label="Upload image or PDF. Drag and drop a file here, or press to open file picker."
          className={cn(
            "flex w-full h-full min-h-[148px] flex-col items-center justify-center rounded-lg p-6 text-center",
            "cursor-pointer border-0 bg-transparent text-inherit",
            "hover:bg-zinc-50 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          )}
        >
          <UploadCloud
            className="w-8 h-8 text-zinc-400 mb-2 pointer-events-none"
            aria-hidden
          />
          <span className="text-sm text-zinc-600 font-medium pointer-events-none">
            Drag & Drop Image/PDF
          </span>
          <span className="text-xs text-zinc-500 mt-1 pointer-events-none">
            or click to browse files
          </span>
        </button>
      )}
    </div>
  );
}
