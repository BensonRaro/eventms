"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { UploadDropzone as UploadThingDropzone } from "@uploadthing/react";

interface UploadThingUploaderProps {
  onUploadComplete: (url: string) => void;
  value?: string;
}

export function UploadThingUploader({
  onUploadComplete,
  value,
}: UploadThingUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const UploadDropzone = UploadThingDropzone as unknown as ComponentType<{
    endpoint: string;
    onUploadBegin?: () => void;
    onClientUploadComplete?: (res: Array<{ url?: string }> | undefined) => void;
    onUploadError?: (error: Error) => void;
    appearance?: Record<string, string>;
    className?: string;
  }>;

  return (
    <div className="space-y-3">
      <UploadDropzone
        endpoint="eventImage"
        onUploadBegin={() => setIsUploading(true)}
        onClientUploadComplete={(res: Array<{ url?: string }> | undefined) => {
          setIsUploading(false);
          if (res?.[0]?.url) {
            onUploadComplete(res[0].url);
          }
        }}
        onUploadError={(error: Error) => {
          setIsUploading(false);
          console.error(error);
        }}
        appearance={{
          button: "ut-button:bg-primary ut-button:text-primary-foreground",
          container: "ut-container:border-input ut-container:bg-background",
          label: "ut-label:text-muted-foreground",
        }}
        className="ut-ready:bg-background ut-uploading:bg-background"
      />

      {isUploading && (
        <p className="text-sm text-muted-foreground">Uploading image...</p>
      )}

      {value && (
        <div className="overflow-hidden rounded-xl border">
          <img
            src={value}
            alt="Event preview"
            className="h-40 w-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
