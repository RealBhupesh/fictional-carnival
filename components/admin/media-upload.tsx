"use client";

import { Button } from "@/components/shared/button";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, UploadCloud, X } from "lucide-react";

interface MediaUploadProps {
  label?: string;
  value?: string;
  onChange: (url?: string) => void;
}

const MediaUpload = ({ label = "Cover image", value, onChange }: MediaUploadProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const resetState = useCallback(() => {
    setDragActive(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file");
        return;
      }

      const maxSizeMb = 5;
      if (file.size / (1024 * 1024) > maxSizeMb) {
        toast.error(`Images must be smaller than ${maxSizeMb}MB`);
        return;
      }

      try {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/admin/content/upload", {
          method: "POST",
          body: formData
        });
        const json = await response.json();
        if (!response.ok || !json?.data?.url) {
          throw new Error(json?.error ?? "Upload failed");
        }
        onChange(json.data.url as string);
        toast.success("Image uploaded");
      } catch (error) {
        console.error(error);
        toast.error((error as Error).message ?? "Unable to upload image");
      } finally {
        setUploading(false);
        resetState();
      }
    },
    [onChange, resetState]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file) {
        void uploadFile(file);
      }
    },
    [uploadFile]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragActive(false);
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-text">{label}</p>
        <p className="text-xs text-text/60">Drag and drop or browse to upload a cover image.</p>
      </div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDrop={onDrop}
        className={`flex h-40 w-full flex-col items-center justify-center rounded-2xl border border-dashed px-4 transition ${
          dragActive ? "border-primary bg-primary/5" : "border-border bg-background"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
        <UploadCloud className="h-6 w-6 text-primary" aria-hidden />
        <p className="mt-2 text-sm text-text/70">
          {dragActive ? "Release to upload" : "Drag & drop or"}{" "}
          <button
            type="button"
            className="font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => inputRef.current?.click()}
          >
            browse
          </button>
        </p>
        <p className="text-xs text-text/50">PNG, JPG, GIF up to 5MB.</p>
        {uploading ? (
          <span className="mt-3 inline-flex items-center gap-2 text-xs text-text/60">
            <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
          </span>
        ) : null}
      </div>
      {value ? (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-background">
          <div className="relative h-48 w-full">
            <Image src={value} alt="Content cover" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-xs text-text/60">{value}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1 text-red-500 hover:text-red-500"
              onClick={() => onChange(undefined)}
            >
              <X className="h-4 w-4" /> Remove
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MediaUpload;
